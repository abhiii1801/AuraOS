from fastapi import Request, HTTPException
import logging

logger = logging.getLogger("AuraOS.APIHelpers")

# ---------------------------------------------------------------------------
# User
# ---------------------------------------------------------------------------

def get_current_user(request: Request, supabase) -> dict:
    """Fetches the authenticated user based on the aura_session cookie."""
    session_id = request.cookies.get("aura_session")
    if not session_id:
        raise HTTPException(status_code=401, detail="Unauthorized: No session cookie found")

    response = (
        supabase.table("users")
        .select("id, email, telegram_chat_id, link_code, name, picture")
        .eq("id", session_id)
        .limit(1)
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid session")
    return response.data[0]
