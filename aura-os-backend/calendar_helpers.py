import logging
from datetime import datetime

logger = logging.getLogger("AuraOS.CalendarHelpers")

def get_upcoming_calendar_events(user_id: str, supabase) -> list:
    """Fetches today's remaining calendar events via Google Calendar."""
    try:
        from google_auth import get_db_credentials
        from googleapiclient.discovery import build

        creds = get_db_credentials(user_id, supabase)
        service = build("calendar", "v3", credentials=creds)

        # Use local time with proper offset for Google API
        now = datetime.now().astimezone()
        time_min = now.isoformat()
        
        # End of the current day in local time
        today_end = now.replace(hour=23, minute=59, second=59, microsecond=0)
        time_max = today_end.isoformat()

        events_result = (
            service.events()
            .list(
                calendarId="primary",
                timeMin=time_min,
                timeMax=time_max,
                singleEvents=True,
                orderBy="startTime",
            )
            .execute()
        )

        result = []
        for event in events_result.get("items", []):
            start = event["start"].get("dateTime", event["start"].get("date", ""))
            if "T" in str(start):
                t = datetime.fromisoformat(start.replace("Z", "+00:00"))
                time_str = t.strftime("%H:%M")
            else:
                time_str = "All day"
            result.append({
                "title": event.get("summary", "Untitled"),
                "time": time_str,
            })
        return result
    except Exception as e:
        logger.error(f"get_upcoming_calendar_events: {e}")
        return []
