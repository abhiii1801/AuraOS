import json
import os
from datetime import datetime

LOG_FILE = "system_logs.json"
MAX_LOGS = 200

def log_event(event_type: str, data: dict):
    """Logs an event to system_logs.json with the latest on top."""
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "type": event_type,
        "data": data
    }
    
    logs = []
    
    # Ensure directory exists or file exists
    if not os.path.exists(LOG_FILE):
        try:
            with open(LOG_FILE, "w") as f:
                json.dump([], f)
        except:
            pass

    try:
        # Simple read and write without fcntl (safer for Windows)
        if os.path.exists(LOG_FILE):
            with open(LOG_FILE, "r") as f:
                content = f.read()
                if content:
                    logs = json.loads(content)
        
        # Prepend the new log entry
        logs.insert(0, log_entry)
        
        # Keep only the last N logs
        logs = logs[:MAX_LOGS]
        
        # Overwrite file with new logs
        with open(LOG_FILE, "w") as f:
            json.dump(logs, f, indent=2)
            
    except Exception as e:
        # Silently fail if logging issues occur to prevent breaking the main flow
        pass
