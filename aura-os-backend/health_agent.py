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
        "active_minutes": "com.google.active_minutes"
    }

    data_type = metric_map.get(metric, "com.google.step_count.delta")

    body = {
        "aggregateBy": [{"dataTypeName": data_type}],
        "bucketByTime": { "durationMillis": 86400000 }, 
        "startTimeMillis": start_time_millis,
        "endTimeMillis": end_time_millis
    }

    try:
        response = service.users().dataset().aggregate(userId="me", body=body).execute()
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
        except Exception:
            results.append({"day": day.strftime("%a"), "steps": 0})

    return results
