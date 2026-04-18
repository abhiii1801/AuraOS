import os.path
import string
import random
import json
import logging
import base64
import re
import time
import asyncio
from datetime import datetime, timedelta
from contextlib import asynccontextmanager
from fastapi.responses import RedirectResponse, JSONResponse
from google_auth_oauthlib.flow import Flow
import requests
import psycopg2
from fastapi import FastAPI, Request, BackgroundTasks, Response
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
from google.genai import types
from supabase import create_client, Client
from apscheduler.schedulers.asyncio import AsyncIOScheduler

# Import Agents and Utils
from telegram_utils import send_telegram_message
from api_helpers import get_current_user
from health_agent import get_daily_fitness_data, get_weekly_fitness_data
from finance_helpers import (
    get_mtd_spent, get_total_income, get_top_category,
    get_transactions, get_subscriptions, get_chart_data, get_category_breakdown, _get_date_range
)
from second_brain_helpers import get_vault_nodes_and_links
from calendar_helpers import get_upcoming_calendar_events
from dashboard_helpers import generate_briefing, generate_insights
from action_executor import execute_agent_action


# Load environment variables early
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO, format='[%(name)s] %(message)s')
logger = logging.getLogger("AuraOS")


# Initialize FastAPI
app = FastAPI(title="AuraOS Master Backend")

# Initialize Supabase
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

# Consolidated Scopes for all Google modules
SCOPES = [
    'openid', 
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/fitness.activity.read',
    'https://www.googleapis.com/auth/fitness.location.read'
]

# A temporary store to remember the OAuth flow between page loads
oauth_store = {}

@app.get("/login")
def login_with_google():
    """Redirects the user to the Google Consent Screen."""
    flow = Flow.from_client_secrets_file(
        'credentials.json',
        scopes=SCOPES,
        # Make sure this exact URI is added in your Google Cloud Console -> Credentials!
        redirect_uri='http://localhost:8000/auth/callback' 
    )
    # access_type='offline' is CRITICAL to get the refresh_token!
    auth_url, state = flow.authorization_url(prompt='consent', access_type='offline')
    
    # NEW: Save the flow instance so it remembers the PKCE code_verifier
    oauth_store['current_flow'] = flow 
    
    return RedirectResponse(auth_url)

@app.get("/auth/callback")
def google_auth_callback(code: str):
    """Google sends the user here after they log in."""
    try:
        # NEW: Retrieve the exact same flow instance we created in /login
        flow = oauth_store.get('current_flow')
        if not flow:
            return {"error": "Authentication session lost. Please go to /login and try again."}

        # This will now work because the flow remembers the secret verifier!
        flow.fetch_token(code=code)
        credentials = flow.credentials

        # 1. Ask Google for the user's email address using the new token
        user_info = requests.get(
            "https://www.googleapis.com/oauth2/v1/userinfo?alt=json", 
            headers={"Authorization": f"Bearer {credentials.token}"}
        ).json()
        user_email = user_info.get("email")
        user_name = user_info.get("name", user_info.get("given_name", ""))
        user_picture = user_info.get("picture", "")

        if not user_email:
            return {"error": "Failed to get user email from Google."}

        # 2. Generate a fresh Telegram link code
        link_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

        # 3. Save the email and Refresh Token to Supabase
        # (Upsert means: update their row if they exist, create a new one if they don't)
        supabase.table("users").upsert({
            "email": user_email,
            "google_refresh_token": credentials.refresh_token,
            "link_code": link_code,
            "name": user_name,
            "picture": user_picture
        }, on_conflict="email").execute()

        # Fetch the user to get the UUID (since upsert might not return it directly based on config)
        user_response = supabase.table("users").select("id").eq("email", user_email).execute()
        user_id = user_response.data[0]["id"]

        # Redirect to the frontend dashboard and set a secure session cookie
        response = RedirectResponse(url="http://localhost:3000/dashboard")
        response.set_cookie(key="aura_session", value=user_id, httponly=True, max_age=86400 * 30, samesite="Lax")
        return response
        
    except Exception as e:
        return {"error": f"Authentication failed: {str(e)}"}


@app.get("/api/auth/status")
def auth_status(request: Request):
    """Verifies that the user is logged in by checking the session cookie."""
    try:
        user = get_current_user(request, supabase)
        return {"logged_in": True, "user_id": user["id"], "email": user["email"]}
    except Exception:
        return {"logged_in": False}

@app.get("/api/auth/logout")
def logout():
    """Logs out the user by clearing the session cookie."""
    response = RedirectResponse(url="http://localhost:3000/")
    response.delete_cookie(key="aura_session")
    return response


import scheduled_tasks

# Initialize the scheduler
scheduler = AsyncIOScheduler()

# Add this to your scheduler
scheduler.add_job(scheduled_tasks.send_morning_digest, 'cron', hour=8, minute=0, kwargs={'supabase': supabase})

# Schedule the job to run every day at 8:00 AM
scheduler.add_job(scheduled_tasks.check_daily_bills, 'cron', hour=8, minute=0, kwargs={'supabase': supabase})
# TEST MODE: Run every 1 minute to check if the scheduler is working
# scheduler.add_job(scheduled_tasks.check_daily_bills, 'interval', minutes=1, kwargs={'supabase': supabase})

# Use FastAPI lifespan to start/stop the scheduler safely
@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler.start()
    yield
    scheduler.shutdown()

# Update your FastAPI app to use the lifespan
app.router.lifespan_context = lifespan

# Initialize the NEW Gemini Client
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

# Load instructions for the Router Brain
with open("router_instruction.txt", "r") as f:
    router_instruction = f.read()

# Define the request body format
class UserInput(BaseModel):
    prompt: str

class ChatRequest(BaseModel):
    message: str
    context: str = "global"  # "global" | "finance" | "vault" | "health"

@app.get("/")
def read_root():
    return {"status": "AuraOS Backend is alive and running."}

@app.get("/dev/create_test_user")
def create_test_user():
    """Simulates a web user signing up and generates a Telegram link code."""
    # Generate a random 6-character uppercase code (e.g., A7X9V2)
    link_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    
    try:
        # Create a dummy user in our new table
        response = supabase.table("users").insert({
            "email": "abhinav_admin@auraos.dev",
            "link_code": link_code,
            "google_refresh_token": "dummy_token_for_now" # We will get the real one later
        }).execute()
        
        return {
            "message": "Test user successfully created in Supabase!",
            "your_telegram_code": f"/link {link_code}",
            "next_step": "Copy the command above and send it to your Telegram bot."
        }
    except Exception as e:
        return {"error": str(e), "hint": "Did you update your database schema?"}




@app.post("/webhook/telegram")
async def telegram_webhook(req: Request, background_tasks: BackgroundTasks):
    req_data = await req.json()
    
    # 1. Safely grab the message or return early if no message
    message = req_data.get("message")
    if not message:
        return {"status": "ignored"}

    chat_id = message["chat"]["id"]
    user_text = message.get("text", "").strip()
    message_sent_timestamp = message.get("date", int(time.time()))

    # 2. Account Linking Logic
    if "text" in message:
        if user_text.startswith("/link"):
            parts = user_text.split(" ")
            if len(parts) < 2:
                send_telegram_message(chat_id, "⚠️ Please provide your 6-digit link code. Example: `/link A7X9V2`")
                return {"status": "ok"}
            
            link_code = parts[1].upper()
            
            # 1. Search Supabase for the user holding this exact code
            user_response = supabase.table("users").select("id").eq("link_code", link_code).execute()
            
            if user_response.data:
                user_id = user_response.data[0]["id"]
                
                # 2. Update their row: attach the Telegram ID and destroy the link code so it can't be reused
                supabase.table("users").update({
                    "telegram_chat_id": chat_id,
                    "link_code": None 
                }).eq("id", user_id).execute()
                
                send_telegram_message(chat_id, "✅ **Telegram Successfully Linked!**\nYour device is now securely connected to your AuraOS account.")
            else:
                send_telegram_message(chat_id, "⚠️ Invalid or expired link code. Please generate a new one from the web dashboard.")
            
            # Return immediately so it doesn't trigger the AI router
            return {"status": "ok"}

    # 👇 NEW: THE AUTHENTICATION GATEKEEPER
    user_response = supabase.table("users").select("id").eq("telegram_chat_id", chat_id).execute()
    
    if not user_response.data:
        logger.warning(f"Unauthorized access attempt from chat_id: {chat_id}")
        send_telegram_message(chat_id, "⚠️ Unrecognized device. Please link your account by typing `/link <YOUR_CODE>` generated from the web dashboard.")
        return {"status": "ok"} # Stop the code here! Don't call Gemini.
        
    user_id = user_response.data[0]["id"]
    logger.info(f"Authenticated user_id: {user_id}")

    # 4. Filter for text-only messages for the AI router
    if not user_text:
        return {"status": "ok"}

    logger.info(f"[Telegram Webhook] Received message from chat_id {chat_id}: '{user_text}'")

    try:
        current_time = datetime.now().isoformat()
        context_prompt = f"Current System Time: {current_time}\n\nUser Prompt: {user_text}"

        # 1. Ask the Gemini Router to analyze the text
        logger.info("[Telegram Webhook] Calling Gemini router...")
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=context_prompt,
            config=types.GenerateContentConfig(
                system_instruction=router_instruction,
                response_mime_type="application/json",
                temperature=0.1,
            )
        )
        routing_plan = json.loads(response.text)
        logger.info(f"[Telegram Webhook] Routing Plan received: {json.dumps(routing_plan)}")

        # 2. Execute the actions based on the plan
        reply_text = "I processed your request:\n"

        for action in routing_plan.get("actions", []):
            agent = action.get("agent")
            params = action.get("parameters", {})
            logger.info(f"[Telegram Webhook] Executing action for agent: {agent}")

            snippet = await execute_agent_action(
                agent, params, user_id, chat_id, background_tasks, supabase, client, message_sent_timestamp
            )
            if snippet:
                reply_text += snippet + "\n"

        # 3. Send the final confirmation back to your phone
        logger.info(f"[Telegram Webhook] Sending summary reply to user: {reply_text.strip()}")
        send_telegram_message(chat_id, reply_text)
        logger.info("[Telegram Webhook] Webhook processing completed successfully.")

    except Exception as e:
        logger.error(f"[Telegram Webhook] Error during processing: {str(e)}")
        send_telegram_message(chat_id, f"Oops, something broke: {str(e)}")

    return {"status": "ok"}





# ============================================================
# FRONTEND REST API
# ============================================================

# Agent name -> action_taken tag for the /api/chat response
_ACTION_TAG = {
    "finance_agent":            "logged_expense",
    "finance_query_agent":      "query_result",
    "subscription_agent":       "saved_subscription",
    "calendar_agent":           "created_event",
    "second_brain_agent":       "saved_to_vault",
    "second_brain_query_agent": "query_result",
    "reminder_agent":           "set_reminder",
    "inbox_agent":              "searched_email",
    "email_drafter_agent":      "drafted_email",
    "info_agent":               "fetched_info",
    "health_agent":             "health_data",
    "general_chat":             "chat_response",
}


async def _run_chat_pipeline(
    message: str,
    context: str,
    user_id: str,
    background_tasks: BackgroundTasks = None,
    telegram_chat_id=None,
) -> dict:
    """
    Shared AI pipeline for /api/chat.
    Runs the Gemini router, dispatches to agents, returns {reply, action_taken}.
    """
    current_time = datetime.now().isoformat()
    context_prompt = (
        f"Current System Time: {current_time}\n"
        f"Context Domain: {context}\n"
        f"User Prompt: {message}"
    )

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=context_prompt,
        config=types.GenerateContentConfig(
            system_instruction=router_instruction,
            response_mime_type="application/json",
            temperature=0.1,
        ),
    )
    routing_plan = json.loads(response.text)
    logger.info(f"[API Chat] Routing plan: {json.dumps(routing_plan)}")

    actions = routing_plan.get("actions", [])
    first_agent = actions[0].get("agent", "general_chat") if actions else "general_chat"
    action_taken = _ACTION_TAG.get(first_agent, "chat_response")

    reply_parts = []
    message_sent_timestamp = int(datetime.now().timestamp())

    for action in actions:
        agent  = action.get("agent")
        params = action.get("parameters", {})

        snippet = await execute_agent_action(
            agent, params, user_id, telegram_chat_id, background_tasks, supabase, client, message_sent_timestamp
        )
        if snippet:
            reply_parts.append(snippet)

    return {
        "reply":        "\n".join(p.strip() for p in reply_parts if p.strip()),
        "action_taken": action_taken,
    }


# ------------------------------------------------------------------
# 1. POST /api/chat
# ------------------------------------------------------------------
@app.post("/api/chat")
async def api_chat(request: Request, body: ChatRequest, background_tasks: BackgroundTasks):
    """AI chat endpoint - returns structured {reply, action_taken}."""
    try:
        user   = get_current_user(request, supabase)
        result = await _run_chat_pipeline(
            body.message, body.context, user["id"],
            background_tasks, user.get("telegram_chat_id"),
        )
        return result
    except Exception as e:
        logger.error(f"[API /chat] {e}")
        return {"reply": f"Error: {str(e)}", "action_taken": "error"}


# ------------------------------------------------------------------
# 2. GET /api/dashboard/summary
# ------------------------------------------------------------------
@app.get("/api/dashboard/summary")
async def api_dashboard_summary(request: Request):
    """Personalised briefing, upcoming events, step count and MTD spend."""
    try:
        user      = get_current_user(request, supabase)
        user_id   = user["id"]
        user_name = user.get("name") or user.get("email", "there").split("@")[0].capitalize()

        upcoming_events = get_upcoming_calendar_events(user_id, supabase)
        subscriptions   = get_subscriptions(supabase, user_id)
        mtd_spent       = get_mtd_spent(supabase, user_id)

        steps_raw   = get_daily_fitness_data("steps", user_id=user_id, supabase=supabase)
        today_steps = int(steps_raw) if isinstance(steps_raw, (int, float)) else 0

        briefing = generate_briefing(user_name, upcoming_events, subscriptions)
        insights = generate_insights(user_id, supabase)

        return {
            "user_name":       user_name,
            "briefing":        briefing,
            "upcoming_events": upcoming_events,
            "today_steps":     today_steps,
            "mtd_spent":       mtd_spent,
            "insights":        insights,
            "telegram_linked": user.get("telegram_chat_id") is not None,
        }
    except Exception as e:
        logger.error(f"[API /dashboard/summary] {e}")
        return {"error": str(e)}


# ------------------------------------------------------------------
# 3. GET /api/finance/data
# ------------------------------------------------------------------
@app.get("/api/finance/data")
async def api_finance_data(request: Request, filter: str = "Current Month"):
    """Finance KPIs, subscriptions, recent transactions and daily spend chart."""
    try:
        user    = get_current_user(request, supabase)
        user_id = user["id"]
        subscriptions = get_subscriptions(supabase, user_id)
        
        if filter == "bundled":
            # Fetch exactly 1 array of data covering the maximum bound (Last Month to Today)
            now = datetime.now()
            start_bound = (now.replace(day=1) - timedelta(days=1)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            
            raw_res = supabase.table("expenses").select("*").eq("user_id", user_id).gte("transaction_date", start_bound.isoformat()).execute()
            raw_data = raw_res.data or []
            
            result = {"is_bundled": True, "subscriptions": subscriptions, "bundles": {}}
            for f in ["This Week", "Current Month", "Last Month"]:
                start_iso, end_iso = _get_date_range(f)
                result["bundles"][f] = {
                    "kpis": {
                        "total_spent":  get_mtd_spent(supabase, user_id, start_iso, end_iso, raw_data),
                        "total_income": get_total_income(supabase, user_id, start_iso, end_iso, raw_data),
                        "top_category": get_top_category(supabase, user_id, start_iso, end_iso, raw_data),
                    },
                    "category_breakdown": get_category_breakdown(supabase, user_id, start_iso, end_iso, raw_data),
                    "transactions":  get_transactions(supabase, user_id, start_iso, end_iso, 40, raw_data),
                    "chart_data":    get_chart_data(supabase, user_id, start_iso, end_iso, raw_data),
                }
            return result
        else:
            start_iso, end_iso = _get_date_range(filter)
            return {
                "is_bundled": False,
                "kpis": {
                    "total_spent":  get_mtd_spent(supabase, user_id, start_iso, end_iso),
                    "total_income": get_total_income(supabase, user_id, start_iso, end_iso),
                    "top_category": get_top_category(supabase, user_id, start_iso, end_iso),
                },
                "category_breakdown": get_category_breakdown(supabase, user_id, start_iso, end_iso),
                "subscriptions": subscriptions,
                "transactions":  get_transactions(supabase, user_id, start_iso, end_iso),
                "chart_data":    get_chart_data(supabase, user_id, start_iso, end_iso),
            }
    except Exception as e:
        logger.error(f"[API /finance/data] {e}")
        return {"error": str(e)}


# ------------------------------------------------------------------
# 4. GET /api/vault/nodes
# ------------------------------------------------------------------
@app.get("/api/vault/nodes")
async def api_vault_nodes(request: Request):
    """Second Brain nodes and cosine-similarity links for the 3D graph."""
    try:
        user = get_current_user(request, supabase)
        nodes, links = get_vault_nodes_and_links(supabase, user["id"])
        return {"nodes": nodes, "links": links}
    except Exception as e:
        logger.error(f"[API /vault/nodes] {e}")
        return {"error": str(e)}


# ------------------------------------------------------------------
# 5. GET /api/health/metrics
# ------------------------------------------------------------------
@app.get("/api/health/metrics")
async def api_health_metrics(request: Request):
    """Today's fitness metrics and the 7-day step chart."""
    try:
        user    = get_current_user(request, supabase)
        user_id = user["id"]

        def safe_int(v):  return int(v)             if isinstance(v, (int, float)) else 0
        def safe_km(v):   return round(v / 1000, 2) if isinstance(v, (int, float)) else 0.0

        return {
            "steps":          safe_int(get_daily_fitness_data("steps",          user_id=user_id, supabase=supabase)),
            "distance":       safe_km( get_daily_fitness_data("distance",       user_id=user_id, supabase=supabase)),
            "calories":       safe_int(get_daily_fitness_data("calories",       user_id=user_id, supabase=supabase)),
            "active_minutes": safe_int(get_daily_fitness_data("active_minutes", user_id=user_id, supabase=supabase)),
            "weekly_chart":   get_weekly_fitness_data(user_id=user_id, supabase=supabase),
        }
    except Exception as e:
        logger.error(f"[API /health/metrics] {e}")
        return {"error": str(e)}


# ------------------------------------------------------------------
# 6. GET /api/user/profile
# ------------------------------------------------------------------
@app.get("/api/user/profile")
async def api_user_profile(request: Request):
    """User profile with Telegram link status."""
    try:
        user = get_current_user(request, supabase)
        return {
            "email":           user.get("email"),
            "telegram_linked": user.get("telegram_chat_id") is not None,
            "link_code":       user.get("link_code"),
            "name":            user.get("name"),
            "picture":         user.get("picture"),
        }
    except Exception as e:
        logger.error(f"[API /user/profile] {e}")
        return {"error": str(e)}
