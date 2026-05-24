import json
import time
import logging
from google.oauth2.credentials import Credentials

logger = logging.getLogger("AuraOS.GoogleAuth")

# In-memory caches to prevent repetitive DB and Disk IO
_client_info_cache = None
_credentials_cache = {}
CACHE_TTL = 3600  # Cache duration (1 hour)

def get_client_info():
    global _client_info_cache
    if _client_info_cache is None:
        with open('credentials.json', 'r') as f:
            creds_data = json.load(f)
            auth_type = "installed" if "installed" in creds_data else "web"
            _client_info_cache = creds_data[auth_type]
    return _client_info_cache

def get_db_credentials(user_id: str, supabase):
    """Fetches the refresh_token from Supabase and builds a Google Credentials object."""
    try:
        now = time.time()
        
        # 1. Check in-memory cache for the live Credentials object
        if user_id in _credentials_cache:
            creds, timestamp = _credentials_cache[user_id]
            # If cache is valid, return the active instance (saves building it and fetching new access tokens)
            if now - timestamp < CACHE_TTL:
                return creds

        # 2. Cache miss or expired. Fetch from Supabase
        user_response = supabase.table("users").select("google_refresh_token").eq("id", user_id).execute()
        if not user_response.data or not user_response.data[0].get("google_refresh_token"):
            _credentials_cache.pop(user_id, None)
            raise Exception("Google account not linked. Please sign in via the web dashboard.")
        
        refresh_token = user_response.data[0]["google_refresh_token"]

        # 3. Build the live Google Credentials object
        client_info = get_client_info()
        creds = Credentials(
            token=None,
            refresh_token=refresh_token,
            token_uri=client_info["token_uri"],
            client_id=client_info["client_id"],
            client_secret=client_info["client_secret"]
        )
        
        # Update cache with the active Credentials object
        _credentials_cache[user_id] = (creds, now)
        return creds

    except Exception as e:
        logger.error(f"Failed to build Google Credentials: {e}")
        raise Exception(f"Failed to build Google Credentials: {str(e)}")
