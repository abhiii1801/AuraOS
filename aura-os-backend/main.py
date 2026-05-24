import string
import random
import json
import logging
import time
import asyncio
import os
from datetime import datetime, timedelta ,date
from contextlib import asynccontextmanager
from fastapi.responses import RedirectResponse, JSONResponse
from google_auth_oauthlib.flow import Flow
import requests
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
from health_agent import get_daily_fitness_data, get_weekly_fitness_data, generate_health_diagnostic
from finance_helpers import (
    get_mtd_spent, get_total_income, get_top_category,
    get_transactions, get_subscriptions, get_chart_data, get_category_breakdown, _get_date_range
)
from second_brain_helpers import get_vault_nodes_and_links
from calendar_helpers import get_upcoming_calendar_events
from dashboard_helpers import generate_briefing, generate_insights
from action_executor import execute_agent_action
from info_helpers import get_news_headlines, get_recent_emails_structured, get_email_ai_summary, get_subscription_videos


# Load environment variables early
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger("AuraOS")
logging.getLogger("uvicorn.access").setLevel(logging.WARNING)

from logging_utils import log_event


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
    'https://www.googleapis.com/auth/fitness.location.read',
    'https://www.googleapis.com/auth/fitness.sleep.read',
    'https://www.googleapis.com/auth/fitness.heart_rate.read'
]

# A temporary store to remember the OAuth flow between page loads
oauth_store = {}

@app.get("/")
def read_root(request: Request):
    """Redirects the user to the dashboard if logged in, else to landing page."""
    try:
        get_current_user(request, supabase)
        return RedirectResponse(url="http://localhost:5173/overview")
    except Exception:
        return RedirectResponse(url="http://localhost:5173/")

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
        response = RedirectResponse(url="http://localhost:5173/overview")
        response.set_cookie(key="aura_session", value=user_id, httponly=True, max_age=86400 * 30, samesite="Lax")
        return response
        
    except Exception as e:
        return {"error": f"Authentication failed: {str(e)}"}


@app.get("/api/auth/status")
def auth_status(request: Request):
    """Verifies that the user is logged in by checking the session cookie."""
    try:
        user = get_current_user(request, supabase)
        # Check if onboarding is completed by looking for user_preferences
        prefs_res = supabase.table("user_preferences").select("id").eq("user_id", user["id"]).execute()
        onboarding_completed = len(prefs_res.data) > 0
        return {"logged_in": True, "user_id": user["id"], "email": user["email"], "onboarding_completed": onboarding_completed}
    except Exception:
        return {"logged_in": False, "onboarding_completed": False}

@app.get("/api/auth/logout")
def logout():
    """Logs out the user by clearing the session cookie."""
    response = RedirectResponse(url="http://localhost:5173/")
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
        log_event("GEMINI_CALL", {"agent": "master_brain", "action": "telegram_route", "prompt": context_prompt})
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=context_prompt,
            config=types.GenerateContentConfig(
                system_instruction=router_instruction,
                response_mime_type="application/json",
                temperature=0.1,
            )
        )
        routing_plan = json.loads(response.text)
        log_event("GEMINI_RESPONSE", {"agent": "master_brain", "action": "telegram_route", "raw_output": routing_plan})
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

    log_event("GEMINI_CALL", {"agent": "master_brain", "action": "chat_route", "prompt": context_prompt})
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
    log_event("GEMINI_RESPONSE", {"agent": "master_brain", "action": "chat_route", "raw_output": routing_plan})
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

    final_text_blocks = "\n".join(p.strip() for p in reply_parts if p.strip())
    
    # NLP Smoothing step to satisfy "just reply in plain english text" requirement.
    if final_text_blocks:
        try:
            print(final_text_blocks)
            rewrite_prompt = f"The user asked: '{message}'. The system performed the following and generated this output: '''{final_text_blocks}'''. Rewrite this outcome into a short, friendly, plain English sentence (max 2 sentences). Do NOT use markdown. Do NOT list the raw data. Just say what you did or what the result is naturally. The result must be successful for the user, if the user asked for something make sure it is avaialable in the text, if not then write the appropiate message"
            res = client.models.generate_content(
                model="gemini-2.5-flash", 
                contents=rewrite_prompt,
                config=types.GenerateContentConfig(temperature=0.4)
            )
            final_reply = res.text.strip().replace("*", "")
        except Exception:
            final_reply = final_text_blocks
    else:
        final_reply = "I'm not sure how to handle that right now."

    return {
        "reply":        final_reply,
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
def _fetch_active_projects(sb, uid):
    res = sb.table("vault_projects").select("id", count="exact").eq("user_id", uid).eq("status", "active").execute()
    return res.count if getattr(res, "count", None) is not None else len(res.data or [])

def _fetch_recent_notes(sb, uid):
    res = sb.table("second_brain").select("id, category, content, created_at").eq("user_id", uid).order("created_at", desc=True).limit(5).execute()
    colors = ["bg-aura-purple text-white", "bg-blue-100 text-blue-600", "bg-emerald-100 text-emerald-600", "bg-orange-100 text-orange-600", "bg-indigo-100 text-indigo-600"]
    mapped = []
    for i, row in enumerate(res.data or []):
        content = row.get("content", "Untitled Node")
        mapped.append({
            "id": str(row["id"]),
            "title": content[:40] + ("..." if len(content) > 40 else ""),
            "category": row.get("category", "Misc"),
            "date": row.get("created_at", "")[:10],
            "status": "Saved",
            "color": colors[i % len(colors)]
        })
    return mapped

@app.get("/api/dashboard/summary")
async def api_dashboard_summary(request: Request):
    """Personalised briefing, upcoming events, step count and MTD spend."""
    try:
        user      = get_current_user(request, supabase)
        user_id   = user["id"]
        
        log_event("API_HIT", {"endpoint": "/api/dashboard/summary", "user_id": user_id})
        user_name = user.get("name") or user.get("email", "there").split("@")[0].capitalize()

        today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
        today_end = datetime.now().replace(hour=23, minute=59, second=59, microsecond=999999).isoformat()

        events_task = asyncio.to_thread(get_upcoming_calendar_events, user_id, supabase)
        subs_task   = asyncio.to_thread(get_subscriptions, supabase, user_id)
        spend_task  = asyncio.to_thread(get_mtd_spent, supabase, user_id, today_start, today_end)
        steps_task  = asyncio.to_thread(get_daily_fitness_data, "steps", user_id=user_id, supabase=supabase)
        insights_task = asyncio.to_thread(generate_insights, user_id, supabase)
        projects_task = asyncio.to_thread(_fetch_active_projects, supabase, user_id)
        notes_task = asyncio.to_thread(_fetch_recent_notes, supabase, user_id)

        upcoming_events, subscriptions, today_spent, steps_raw, insights, active_projects, recent_notes = await asyncio.gather(
            events_task, subs_task, spend_task, steps_task, insights_task, projects_task, notes_task
        )

        today_steps = int(steps_raw) if isinstance(steps_raw, (int, float)) else 0

        # Briefing requires events, subscriptions and today's steps
        briefing = await asyncio.to_thread(generate_briefing, user_name, upcoming_events, subscriptions, today_steps)

        return {
            "user_name":       user_name,
            "email":           user.get("email"),
            "briefing":        briefing,
            "upcoming_events": upcoming_events,
            "today_steps":     today_steps,
            "today_spent":     today_spent,
            "active_projects": active_projects,
            "recent_notes":    recent_notes,
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

@app.get("/api/vault/projects")
async def api_vault_projects(request: Request):
    """Fetch all projects for the user."""
    try:
        user = get_current_user(request, supabase)
        res = supabase.table("vault_projects").select("*").eq("user_id", user["id"]).order("created_at", desc=True).execute()
        return res.data
    except Exception as e:
        logger.error(f"[API /vault/projects] {e}")
        return {"error": str(e)}

@app.post("/api/vault/projects")
async def api_create_vault_project(request: Request):
    """Create a new project."""
    try:
        user = get_current_user(request, supabase)
        body = await request.json()
        data = {
            "user_id": user["id"],
            "name": body.get("name", "New Project"),
            "description": body.get("description", ""),
        }
        res = supabase.table("vault_projects").insert(data).execute()
        return res.data[0] if res.data else {"error": "Failed to create"}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/vault/files")
async def api_vault_files(request: Request, project_id: str = None):
    """Fetch files for the user, optionally filtered by project_id."""
    try:
        user = get_current_user(request, supabase)
        query = supabase.table("vault_files").select("*").eq("user_id", user["id"])
        if project_id:
            query = query.eq("project_id", project_id)
        res = query.order("created_at", desc=True).execute()
        return res.data
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/vault/summary")
async def api_vault_summary(request: Request):
    """Returns a complete vault summary for dashboard rendering."""
    try:
        user = get_current_user(request, supabase)
        user_id = user["id"]
        summary = _fetch_vault_summary(supabase, user_id)
        return summary
    except Exception as e:
        logger.error(f"[API /vault/summary] {e}")
        return {"error": str(e)}

@app.post("/api/vault/files")
async def api_create_vault_file(request: Request):
    """Save metadata for a vault file upload."""
    try:
        user = get_current_user(request, supabase)
        body = await request.json()
        data = {
            "user_id": user["id"],
            "project_id": body.get("project_id"),
            "filename": body.get("filename", "document.pdf"),
            "storage_path": body.get("storage_path", "vault/files/document.pdf"),
            "size_bytes": body.get("size_bytes", 1024),
        }
        res = supabase.table("vault_files").insert(data).execute()
        return res.data[0] if res.data else {"error": "Failed to upload"}
    except Exception as e:
        return {"error": str(e)}


def _normalize_email_item(item):
    return {
        "id": item.get("id") or f"email-{item.get('sender_email', '')}-{item.get('subject', '')}",
        "from": item.get("sender_name") or item.get("sender_email") or item.get("from") or "Unknown",
        "subject": item.get("subject", ""),
        "snippet": item.get("snippet", ""),
        "time": item.get("date") or item.get("time") or "",
        "unread": item.get("is_unread", item.get("unread", False)),
    }


def _normalize_news_item(item, index):
    return {
        "id": item.get("id") or item.get("url") or f"news-{index}",
        "category": item.get("topic") or item.get("category") or "News",
        "title": item.get("title", ""),
        "source": item.get("source", ""),
        "time": item.get("published_at") or item.get("time") or "",
        "description": item.get("description", ""),
        "url": item.get("url", ""),
        "image": item.get("image", ""),
    }


def _normalize_youtube_item(item, index):
    return {
        "id": item.get("video_id") or item.get("id") or f"video-{index}",
        "title": item.get("title", ""),
        "channel": item.get("channel_name") or item.get("channel", "Unknown Channel"),
        "thumbnail": item.get("thumbnail", item.get("channel_thumb", "")),
        "url": item.get("url", ""),
        "duration": item.get("duration", "--"),
        "views": item.get("views", "--"),
        "time": item.get("published_at") or item.get("time") or "",
    }


def _fetch_vault_summary(sb, user_id):
    projects_res = sb.table("vault_projects").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
    projects = projects_res.data or []
    files_res = sb.table("vault_files").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
    files = files_res.data or []
    nodes, links = get_vault_nodes_and_links(sb, user_id)
    total_notes = len(nodes)
    total_connections = len(links)
    projects_count = len(projects)
    # Safely compute notes created within the last 7 days using date arithmetic
    new_this_week = 0
    try:
        today_date = datetime.now().date()
        for node in nodes:
            ca = node.get("created_at")
            if not ca:
                continue
            try:
                created_dt = datetime.fromisoformat(ca)
            except Exception:
                # Fallback: try parsing only the date portion
                try:
                    created_dt = datetime.fromisoformat(str(ca)[:10])
                except Exception:
                    continue
            if (today_date - created_dt.date()).days < 7:
                new_this_week += 1
    except Exception:
        new_this_week = 0
    folders = [
        {"name": project.get("name", "Untitled"), "count": sum(1 for f in files if f.get("project_id") == project.get("id"))}
        for project in projects
    ]
    return {
        "projects": projects,
        "files": files,
        "nodes": nodes,
        "links": links,
        "kpis": {
            "total_notes": total_notes,
            "total_connections": total_connections,
            "projects": projects_count,
            "new_this_week": new_this_week,
            "storage_used": len(files),
        },
        "folders": folders,
        "recent_notes": [
            {
                "id": node["id"],
                "title": node["content"][:40] + ("..." if len(node["content"]) > 40 else ""),
                "category": node.get("category", "Misc"),
                "date": node.get("created_at", "")[:10],
                "status": "Saved",
                "color": ["bg-aura-purple text-white", "bg-blue-100 text-blue-600", "bg-emerald-100 text-emerald-600", "bg-orange-100 text-orange-600", "bg-indigo-100 text-indigo-600"][hash(node.get("category", "")) % 5],
            }
            for node in nodes[:5]
        ],
    }


# ------------------------------------------------------------------
# 5. GET /api/health/metrics
# ------------------------------------------------------------------
@app.get("/api/health/metrics")
async def api_health_metrics(request: Request):
    """Returns Today's fitness metrics and the 7-day step chart from the database cache."""
    try:
        user    = get_current_user(request, supabase)
        user_id = user["id"]
        today   = date.today().isoformat()

        res = supabase.table("cache_health_metrics").select("metrics_data").eq("user_id", user_id).eq("date", today).execute()
        if res.data and res.data[0].get("metrics_data"):
            return res.data[0]["metrics_data"]
            
        # If no cache exists, return empty structure (frontend should call /sync)
        return {
            "steps": 0, "distance": 0, "calories": 0, "active_minutes": 0, "sleep_hours": 0, "heart_rate": 0,
            "weekly_chart": [],
            "ai_diagnostic": {
                "radar": [
                    {"subject": 'Sleep', "A": 0, "fullMark": 100}, {"subject": 'Focus', "A": 0, "fullMark": 100},
                    {"subject": 'Diet', "A": 0, "fullMark": 100}, {"subject": 'Activity', "A": 0, "fullMark": 100},
                    {"subject": 'Stress', "A": 0, "fullMark": 100}, {"subject": 'Recovery', "A": 0, "fullMark": 100},
                ],
                "insights": [{"title": "No Data", "desc": "Sync required to generate insights."}]
            },
            "needs_sync": True
        }
    except Exception as e:
        logger.error(f"[API GET /health/metrics] {e}")
        return {"error": str(e)}

@app.post("/api/health/sync")
async def api_health_sync(request: Request):
    """Fetches fresh data from Google Fit, generates AI diagnostic, saves to cache, and returns it."""
    try:
        user    = get_current_user(request, supabase)
        user_id = user["id"]
        today   = date.today().isoformat()

        def safe_int(v):  return int(v)             if isinstance(v, (int, float)) else 0
        def safe_km(v):   return round(v / 1000, 2) if isinstance(v, (int, float)) else 0.0

        steps_task    = asyncio.to_thread(get_daily_fitness_data, "steps",          user_id=user_id, supabase=supabase)
        dist_task     = asyncio.to_thread(get_daily_fitness_data, "distance",       user_id=user_id, supabase=supabase)
        cal_task      = asyncio.to_thread(get_daily_fitness_data, "calories",       user_id=user_id, supabase=supabase)
        act_task      = asyncio.to_thread(get_daily_fitness_data, "active_minutes", user_id=user_id, supabase=supabase)
        sleep_task    = asyncio.to_thread(get_daily_fitness_data, "sleep",          user_id=user_id, supabase=supabase)
        hr_task       = asyncio.to_thread(get_daily_fitness_data, "heart_rate",     user_id=user_id, supabase=supabase)
        weekly_task   = asyncio.to_thread(get_weekly_fitness_data, user_id=user_id, supabase=supabase)

        steps_val, dist_val, cal_val, act_val, sleep_val, hr_val, weekly_chart = await asyncio.gather(
            steps_task, dist_task, cal_task, act_task, sleep_task, hr_task, weekly_task
        )

        metrics_dict = {
            "steps":          safe_int(steps_val),
            "distance":       safe_km(dist_val),
            "calories":       safe_int(cal_val),
            "active_minutes": safe_int(act_val),
            "sleep_hours":    round(sleep_val / 3600000.0, 1) if isinstance(sleep_val, (int, float)) else 0.0,
            "heart_rate":     safe_int(hr_val),
        }
        
        # Non-blocking AI call
        ai_diagnostic = await asyncio.to_thread(generate_health_diagnostic, metrics_dict, client)

        full_data = {
            **metrics_dict,
            "weekly_chart":   weekly_chart,
            "ai_diagnostic":  ai_diagnostic
        }

        # Upsert into cache
        supabase.table("cache_health_metrics").upsert({
            "user_id": user_id,
            "date": today,
            "metrics_data": full_data,
            "last_synced": datetime.now().isoformat()
        }).execute()

        return full_data
    except Exception as e:
        logger.error(f"[API POST /health/sync] {e}")
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
            "preferences":     user.get("preferences", {})
        }
    except Exception as e:
        logger.error(f"[API /user/profile] {e}")
        return {"error": str(e)}

# ------------------------------------------------------------------
# 6.5. POST /api/user/preferences
# ------------------------------------------------------------------
@app.post("/api/user/preferences")
async def api_user_preferences_update(request: Request):
    """Updates the user's preferences."""
    try:
        user = get_current_user(request, supabase)
        body = await request.json()
        
        # Upsert user_preferences
        prefs_data = {
            "user_id": user["id"],
            "fitness_goals": body.get("fitness_goals", {}),
            "budget_allocation": body.get("budget_allocation", 0),
            "finance_categories": body.get("finance_categories", []),
            "initial_balance": body.get("initial_balance", 0)
        }
        
        supabase.table("user_preferences").upsert(prefs_data, on_conflict="user_id").execute()
        return {"status": "success", "preferences": prefs_data}
    except Exception as e:
        logger.error(f"[API POST /user/preferences] {e}")
        return {"error": str(e)}

# ------------------------------------------------------------------
# 6.6. POST /api/onboarding
# ------------------------------------------------------------------
@app.post("/api/onboarding")
async def api_onboarding(request: Request):
    """Saves the onboarding questionnaire data."""
    try:
        user = get_current_user(request, supabase)
        body = await request.json()
        
        prefs_data = {
            "user_id": user["id"],
            "fitness_goals": body.get("fitness_goals", {}),
            "budget_allocation": body.get("budget_allocation", 0),
            "finance_categories": body.get("finance_categories", []),
            "initial_balance": body.get("initial_balance", 0)
        }
        
        # Check if exists, update or insert
        existing = supabase.table("user_preferences").select("id").eq("user_id", user["id"]).execute()
        if existing.data:
            supabase.table("user_preferences").update(prefs_data).eq("user_id", user["id"]).execute()
        else:
            supabase.table("user_preferences").insert(prefs_data).execute()
            
        return {"status": "success", "message": "Onboarding completed successfully"}
    except Exception as e:
        logger.error(f"[API POST /onboarding] {e}")
        return {"error": str(e)}

# ------------------------------------------------------------------
# 7. GET /api/info/daily_digest
# ------------------------------------------------------------------
@app.get("/api/info/daily_digest")
async def api_info_daily_digest(request: Request):
    """Returns cached news, emails, and YouTube subscription feed for the Info tab."""
    try:
        user = get_current_user(request, supabase)
        user_id = user["id"]
        today = date.today().isoformat()
        
        log_event("API_HIT", {"endpoint": "GET /api/info/daily_digest", "user_id": user_id})

        res = supabase.table("cache_info_feed").select("*").eq("user_id", user_id).eq("date", today).execute()
        if res.data:
            data = res.data[0]
            # email_summary may be stored as JSON string; try to parse into object
            email_summary_raw = data.get("email_summary", "")
            email_summary_obj = {}
            try:
                if isinstance(email_summary_raw, str) and email_summary_raw:
                    import json as _json
                    email_summary_obj = _json.loads(email_summary_raw)
                elif isinstance(email_summary_raw, dict):
                    email_summary_obj = email_summary_raw
            except Exception:
                email_summary_obj = {"greeting": "Inbox Summary", "brief": str(email_summary_raw), "urgent_count": 0}

            return {
                "news": [_normalize_news_item(item, idx) for idx, item in enumerate(data.get("news_data", []))],
                "emails": [_normalize_email_item(item) for item in data.get("emails_data", [])],
                "email_summary": email_summary_obj,
                "youtube_feed": [_normalize_youtube_item(item, idx) for idx, item in enumerate(data.get("youtube_data", []))],
            }
            
        # If no cache exists
        return {
            "news": [], "emails": [], "email_summary": "", "youtube_feed": [], "needs_sync": True
        }
    except Exception as e:
        logger.error(f"[API GET /info/daily_digest] {e}")
        return {"error": str(e)}

@app.post("/api/info/sync")
async def api_info_sync(request: Request):
    """Fetches fresh news, emails, and youtube data, saves to cache, and returns it."""
    try:
        user = get_current_user(request, supabase)
        user_id = user["id"]
        today = date.today().isoformat()
        
        log_event("API_HIT", {"endpoint": "POST /api/info/sync", "user_id": user_id})

        # Run all three feeds concurrently using asyncio.to_thread (non-blocking)
        news_task    = asyncio.to_thread(get_news_headlines, ["Technology", "AI", "Startups", "India"], 9)
        emails_task  = asyncio.to_thread(get_recent_emails_structured, user_id, supabase, 20)
        videos_task  = asyncio.to_thread(get_subscription_videos, user_id, supabase, 10, 1)

        news, emails, videos = await asyncio.gather(news_task, emails_task, videos_task)

        # Generate AI email summary (also non-blocking)
        email_summary_text = await asyncio.to_thread(get_email_ai_summary, emails, client)

        # Try to parse the AI output (expected JSON array of {text, is_urgent})
        try:
            import json as _json
            parsed = _json.loads(email_summary_text) if isinstance(email_summary_text, str) else []
        except Exception:
            parsed = []

        urgent_count = sum(1 for it in parsed if isinstance(it, dict) and it.get("is_urgent"))
        brief_lines = [it.get("text") for it in parsed[:3] if isinstance(it, dict) and it.get("text")]
        email_summary_obj = {
            "greeting": "Inbox Summary",
            "brief": " \n".join(brief_lines) if brief_lines else "No important items found.",
            "urgent_count": urgent_count,
            "items": parsed,
        }

        full_data = {
            "news": [_normalize_news_item(item, idx) for idx, item in enumerate(news)],
            "emails": [_normalize_email_item(item) for item in emails],
            "email_summary": email_summary_obj,
            "youtube_feed": [_normalize_youtube_item(item, idx) for idx, item in enumerate(videos)],
        }

        # Upsert into cache
        supabase.table("cache_info_feed").upsert({
            "user_id": user_id,
            "date": today,
            "news_data": news,
            "emails_data": emails,
            "youtube_data": videos,
            "email_summary": _json.dumps(email_summary_obj),
            "last_synced": datetime.now().isoformat()
        }).execute()

        return full_data
    except Exception as e:
        logger.error(f"[API POST /info/sync] {e}")
        return {"error": str(e)}
