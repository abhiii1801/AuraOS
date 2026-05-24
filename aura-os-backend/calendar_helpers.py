import logging
from datetime import datetime, timedelta

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
        
        # End of the week
        week_end = now + timedelta(days=7)
        time_max = week_end.isoformat()

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
            # Prefer full dateTime values; fall back to all-day date strings
            start_raw = event["start"].get("dateTime", event["start"].get("date", ""))
            end_raw = event["end"].get("dateTime", event["end"].get("date", ""))

            start_iso = start_raw
            end_iso = end_raw
            time_str = ""
            date_str = ""

            if start_raw and "T" in str(start_raw):
                # Normalize timezone token Z -> +00:00 for parsing
                try:
                    sdt = datetime.fromisoformat(start_raw.replace("Z", "+00:00"))
                    start_iso = sdt.isoformat()
                    time_str = sdt.strftime("%I:%M%p").lower()
                    date_str = sdt.strftime("%d %b, %a").upper()
                except Exception:
                    start_iso = start_raw
            else:
                # All-day event; represent as date-only at midnight
                try:
                    sdt = datetime.strptime(str(start_raw)[:10], "%Y-%m-%d")
                    start_iso = sdt.isoformat()
                    time_str = "All day"
                    date_str = sdt.strftime("%d %b, %a").upper()
                except Exception:
                    pass

            if end_raw and "T" in str(end_raw):
                try:
                    edt = datetime.fromisoformat(end_raw.replace("Z", "+00:00"))
                    end_iso = edt.isoformat()
                except Exception:
                    end_iso = end_raw

            result.append({
                "id": event.get("id"),
                "summary": event.get("summary", "Untitled"),
                "start": start_iso,
                "end": end_iso,
                "time": time_str,
                "date": date_str,
                "is_today": date_str == now.strftime("%d %b, %a").upper(),
                "type": "event",
            })
        return result
    except Exception as e:
        logger.error(f"get_upcoming_calendar_events: {e}")
        return []
