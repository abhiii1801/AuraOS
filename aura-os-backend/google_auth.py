import json
from google.oauth2.credentials import Credentials

def get_db_credentials(user_id: str, supabase):
    """Fetches the refresh_token from Supabase and builds a Google Credentials object."""
    try:
        # 1. Fetch the user's refresh token from Supabase
        user_response = supabase.table("users").select("google_refresh_token").eq("id", user_id).execute()
        if not user_response.data or not user_response.data[0].get("google_refresh_token"):
            raise Exception("Google account not linked. Please sign in via the web dashboard.")
        
        refresh_token = user_response.data[0]["google_refresh_token"]

        # 2. Extract your Client ID & Secret from your local credentials.json
        with open('credentials.json', 'r') as f:
            creds_data = json.load(f)
            auth_type = "installed" if "installed" in creds_data else "web"
            client_info = creds_data[auth_type]

        # 3. Build and return the live Google Credentials object
        return Credentials(
            token=None,
            refresh_token=refresh_token,
            token_uri=client_info["token_uri"],
            client_id=client_info["client_id"],
            client_secret=client_info["client_secret"]
        )
    except Exception as e:
        raise Exception(f"Failed to build Google Credentials: {str(e)}")
