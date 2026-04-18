from datetime import datetime, timedelta
from google_auth import get_db_credentials
from googleapiclient.discovery import build

def get_calendar_service(user_id, supabase):
    creds = get_db_credentials(user_id, supabase)
    return build('calendar', 'v3', credentials=creds)

def create_calendar_event(title: str, start_time_iso: str, reminders_minutes=None, user_id=None, supabase=None):
    """Creates an event on the user's primary calendar."""
    service = get_calendar_service(user_id, supabase)
    
    # Calculate end time based on duration
    start_time = datetime.fromisoformat(start_time_iso.replace('Z', '+00:00'))
    end_time = start_time + timedelta(minutes=60) # Default to 60 minutes for now

    event = {
        'summary': title,
        'start': {
            'dateTime': start_time.isoformat(),
            'timeZone': 'Asia/Kolkata', 
        },
        'end': {
            'dateTime': end_time.isoformat(),
            'timeZone': 'Asia/Kolkata',
        },
    }

    if reminders_minutes:
        overrides = [{'method': 'popup', 'minutes': mins} for mins in reminders_minutes]
        event['reminders'] = {
            'useDefault': False,
            'overrides': overrides
        }

    event_result = service.events().insert(calendarId='primary', body=event).execute()
    return event_result.get('htmlLink')
