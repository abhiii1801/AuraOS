from datetime import datetime, timedelta
from google_auth import get_db_credentials
from googleapiclient.discovery import build

def get_fitness_service(user_id, supabase):
    creds = get_db_credentials(user_id, supabase)
    return build('fitness', 'v1', credentials=creds)

def get_daily_fitness_data(metric: str, user_id=None, supabase=None):
    """Fetches aggregated fitness data for the current day based on the requested metric."""
    service = get_fitness_service(user_id, supabase)
    
    now = datetime.now()
    midnight = now.replace(hour=0, minute=0, second=0, microsecond=0)
    
    start_time_millis = int(midnight.timestamp() * 1000)
    end_time_millis = int(now.timestamp() * 1000)

    metric_map = {
        "steps": "com.google.step_count.delta",
        "calories": "com.google.calories.expended",
        "distance": "com.google.distance.delta",
        "active_minutes": "com.google.active_minutes",
        "heart_rate": "com.google.heart_rate.bpm"
    }

    if metric == "sleep":
        try:
            # Sleep is best fetched via Sessions API (activityType 72 = Sleep)
            from datetime import timedelta
            now_utc = datetime.utcnow()
            yesterday_utc = now_utc - timedelta(days=1)
            start_rfc = yesterday_utc.isoformat("T") + "Z"
            end_rfc = now_utc.isoformat("T") + "Z"
            
            response = service.users().sessions().list(
                userId="me", 
                startTime=start_rfc, 
                endTime=end_rfc, 
                activityType=72
            ).execute()
            
            total_sleep_ms = 0
            for session in response.get("session", []):
                total_sleep_ms += int(session.get("endTimeMillis", 0)) - int(session.get("startTimeMillis", 0))
            return total_sleep_ms
        except Exception as e:
            import logging
            logging.getLogger("AuraOS.HealthAgent").error(f"Sleep API Error: {e}")
            return 0.0

    data_type = metric_map.get(metric, "com.google.step_count.delta")

    body = {
        "aggregateBy": [{"dataTypeName": data_type}],
        "bucketByTime": { "durationMillis": 86400000 }, 
        "startTimeMillis": start_time_millis,
        "endTimeMillis": end_time_millis
    }

    try:
        response = service.users().dataset().aggregate(userId="me", body=body).execute()
        
        if metric == "heart_rate":
            # For heart rate, fpVal in aggregate usually represents the average
            # We'll just return the first valid fpVal (daily average) or 0
            for bucket in response.get("bucket", []):
                for dataset in bucket.get("dataset", []):
                    for point in dataset.get("point", []):
                        for value in point.get("value", []):
                            if "fpVal" in value:
                                return value["fpVal"]
            return 0.0
            
        total_value = 0.0
        for bucket in response.get("bucket", []):
            for dataset in bucket.get("dataset", []):
                for point in dataset.get("point", []):
                    for value in point.get("value", []):
                        if "intVal" in value:
                            total_value += value["intVal"]
                        elif "fpVal" in value:
                            total_value += value["fpVal"]
                            
        return total_value
    except Exception as e:
        import logging
        logging.getLogger("AuraOS.HealthAgent").error(f"Fitness API Error (daily {metric}): {e}")
        return f"Fitness API Error: {str(e)}"


def get_weekly_fitness_data(user_id=None, supabase=None) -> list:
    """Fetches step counts for each of the last 7 days for the weekly chart."""
    service = get_fitness_service(user_id, supabase)
    now = datetime.now()
    results = []

    for i in range(6, -1, -1):   # 6 days ago → today
        day = now - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end   = day.replace(hour=23, minute=59, second=59, microsecond=0)

        body = {
            "aggregateBy": [{"dataTypeName": "com.google.step_count.delta"}],
            "bucketByTime": {"durationMillis": 86400000},
            "startTimeMillis": int(day_start.timestamp() * 1000),
            "endTimeMillis":   int(day_end.timestamp()   * 1000),
        }
        try:
            response = service.users().dataset().aggregate(userId="me", body=body).execute()
            steps = 0
            for bucket in response.get("bucket", []):
                for dataset in bucket.get("dataset", []):
                    for point in dataset.get("point", []):
                        for value in point.get("value", []):
                            if "intVal" in value:
                                steps += value["intVal"]
            results.append({"day": day.strftime("%a"), "steps": steps})
        except Exception as e:
            import logging
            logging.getLogger("AuraOS.HealthAgent").error(f"Weekly Fitness API Error: {e}")
            results.append({"day": day.strftime("%a"), "steps": 0})

    return results

def generate_health_diagnostic(metrics: dict, client) -> dict:
    """Generates an AI health diagnostic using Gemini."""
    import json
    import logging
    logger = logging.getLogger("AuraOS.HealthAgent")
    
    try:
        prompt = f"""
        You are a highly advanced AI health diagnostic system.
        Analyze the following daily metrics:
        Steps: {metrics.get('steps')}
        Distance: {metrics.get('distance')} km
        Calories: {metrics.get('calories')} kcal
        Active Minutes: {metrics.get('active_minutes')} min
        
        Output EXCLUSIVELY as a valid JSON object. Do not use markdown blocks. The object must match this schema:
        {{
            "radar": [
                {{"subject": "Sleep", "A": <number 0-100>, "fullMark": 100}},
                {{"subject": "Focus", "A": <number 0-100>, "fullMark": 100}},
                {{"subject": "Diet", "A": <number 0-100>, "fullMark": 100}},
                {{"subject": "Activity", "A": <number 0-100>, "fullMark": 100}},
                {{"subject": "Stress", "A": <number 0-100>, "fullMark": 100}},
                {{"subject": "Recovery", "A": <number 0-100>, "fullMark": 100}}
            ],
            "insights": [
                {{"title": "<Short string>", "desc": "<Insight description>"}},
                {{"title": "<Short string>", "desc": "<Insight description>"}}
            ]
        }}
        
        Make the insights realistic and based strictly on the provided data.
        """
        
        from logging_utils import log_event
        log_event("GEMINI_CALL", {"agent": "health_agent", "action": "health_diagnostic", "prompt": prompt})

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        
        log_event("GEMINI_RESPONSE", {"agent": "health_agent", "action": "health_diagnostic", "raw_output": response.text})
        
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
            
        return json.loads(text.strip())
    except Exception as e:
        logger.error(f"AI Diagnostic error: {e}")
        return {
            "radar": [
                {"subject": 'Sleep', "A": 50, "fullMark": 100},
                {"subject": 'Focus', "A": 50, "fullMark": 100},
                {"subject": 'Diet', "A": 50, "fullMark": 100},
                {"subject": 'Activity', "A": 50, "fullMark": 100},
                {"subject": 'Stress', "A": 50, "fullMark": 100},
                {"subject": 'Recovery', "A": 50, "fullMark": 100},
            ],
            "insights": [
                {"title": "Data Unavailable", "desc": "Could not generate AI diagnostic at this time."}
            ]
        }
