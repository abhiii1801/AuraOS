import logging
from calendar_agent import create_calendar_event
from inbox_agent import search_emails, summarize_with_ai, draft_email_with_ai
from health_agent import get_daily_fitness_data
from info_agent import search_youtube_videos, fetch_personalized_news
from finance_agent import process_finance_action
from finance_query_agent import process_finance_query_action
from reminder_agent import process_reminder_action
from subscription_agent import process_subscription_action
from second_brain_agent import process_second_brain_action, process_second_brain_query_action

logger = logging.getLogger("AuraOS.ActionExecutor")

async def execute_agent_action(
    agent: str, 
    params: dict, 
    user_id: str, 
    chat_id: str, 
    background_tasks, 
    supabase, 
    client, 
    message_timestamp: int
) -> str:
    """Executes the mapped agent logic and returns the resulting feedback snippet."""
    
    logger.info(f"[Agent Execution] Executing action for agent: {agent}")
    reply_text = ""
    
    if agent == "general_chat":
        reply_text += "Chat: I'm here! Tell me what to log or schedule.\n"
    
    elif agent == "finance_agent":
        try:
            reply_text += process_finance_action(params, supabase, user_id)
        except Exception as e:
            logger.error(f"[Finance Agent] Error: {e}")
            reply_text += f"❌ Finance error: {e}\n"

    elif agent == "finance_query_agent":
        try:
            reply_text += process_finance_query_action(params, user_id)
        except Exception as e:
            logger.error(f"[Finance Query Agent] Error: {e}")
            reply_text += f"❌ Query error: {e}\n"

    elif agent == "calendar_agent":
        title = params.get("title", "AuraOS Event")
        start_time = params.get("start_time") 
        reminders_minutes = params.get("reminders_minutes")
        if start_time:
            try:
                event_link = create_calendar_event(title, start_time, reminders_minutes=reminders_minutes, user_id=user_id, supabase=supabase)
                reply_text += f"📅 Scheduled: '{title}'.\n"
                if reminders_minutes:
                    formatted_mins = ", ".join(f"{m} min{'s' if m != 1 else ''}" for m in reminders_minutes)
                    reply_text += f"🔔 Attached pop-up reminders for {formatted_mins} before.\n"
            except Exception as e:
                logger.error(f"[Calendar Agent] Error: {e}")
                reply_text += f"❌ Calendar error: {e}\n"
        else:
            logger.warning("[Calendar Agent] Missing start_time")
            reply_text += "⚠️ I couldn't figure out the exact time for the meeting.\n"

    elif agent == "reminder_agent":
        if background_tasks is not None:
            try:
                reply_text += process_reminder_action(params, chat_id, background_tasks, message_timestamp)
            except Exception as e:
                logger.error(f"[Reminder Agent] Error: {e}")
                reply_text += f"❌ Reminder error: {e}\n"
        else:
            reply_text += "Reminder noted (Telegram delivery requires an active link)."

    elif agent == "subscription_agent":
        try:
            reply_text += process_subscription_action(params, supabase, user_id)
        except Exception as e:
            logger.error(f"[Subscription Agent] Error: {e}")
            reply_text += f"❌ Subscription config error: {e}\n"
    elif agent == "inbox_agent":
        search_query = params.get("search_query", "is:unread")
        count = int(params.get("count", 3))
        reply_text += f"🔍 Searching Gmail for: `{search_query}`\n\n"
        
        raw_emails = search_emails(query=search_query, user_id=user_id, supabase=supabase, max_results=count)
        
        if "No emails found" in raw_emails or "Error" in raw_emails:
            reply_text += raw_emails + "\n"
        else:
            ai_summary = summarize_with_ai(raw_emails, client)
            reply_text += f"✨ **AI Summary:**\n{ai_summary}\n"

    elif agent == "email_drafter_agent":
        target_sender = params.get("target_sender", "")
        instructions = params.get("draft_instructions", "")
        reply_text += f"✍️ Drafting a reply to {target_sender}...\n\n"
        
        search_query = f"from:{target_sender}"
        found_email = search_emails(query=search_query, user_id=user_id, supabase=supabase, max_results=1)
        
        if "No emails found" in found_email:
            reply_text += f"⚠️ I couldn't find a recent email from {target_sender} to reply to.\n"
        else:
            drafted_response = draft_email_with_ai(found_email, instructions, client)
            reply_text += f"📧 **Drafted Reply:**\n\n{drafted_response}\n"
    
    elif agent == "info_agent":
        topic = params.get("topic", "")
        source = params.get("source", "both")
        
        reply_text += f"🔎 Looking up '{topic}' on {source}...\n\n"
        
        results = ""
        if source in ["news", "both"]:
            results += fetch_personalized_news([topic]) + "\n\n"
        if source in ["youtube", "both"]:
            results += search_youtube_videos(topic, user_id=user_id, supabase=supabase)
        
        reply_text += results

    elif agent == "health_agent":
        metric = params.get("metric", "steps").lower()
        if metric == "all":
            reply_text += "🏃‍♂️ Fetching your daily fitness summary...\n\n"
            metrics_to_fetch = ["steps", "calories", "distance", "active_minutes"]
            for m in metrics_to_fetch:
                value = get_daily_fitness_data(m, user_id=user_id, supabase=supabase)
                if isinstance(value, str) and "Error" in value:
                    reply_text += f"⚠️ **{m.capitalize()}:** {value}\n"
                else:
                    if m == "steps":
                        reply_text += f"👟 **Steps:** {int(value)}\n"
                    elif m == "calories":
                        reply_text += f"🔥 **Calories Burned:** {int(value)} kcal\n"
                    elif m == "distance":
                        reply_text += f"📏 **Distance:** {round(value / 1000, 2)} km\n"
                    elif m == "active_minutes":
                        reply_text += f"⏱️ **Active Time:** {int(value)} mins\n"
        else:
            reply_text += f"🏃‍♂️ Checking your Google Fit data for {metric}...\n\n"
            value = get_daily_fitness_data(metric, user_id=user_id, supabase=supabase)
            if isinstance(value, str) and "Error" in value:
                reply_text += f"⚠️ {value}\n"
            else:
                if metric == "steps":
                    reply_text += f"👟 You have taken **{int(value)} steps** today.\n"
                elif metric == "calories":
                    reply_text += f"🔥 You have burned **{int(value)} calories** today.\n"
                elif metric == "distance":
                    reply_text += f"📏 You have covered **{round(value / 1000, 2)} km** today.\n"
                elif metric == "active_minutes":
                    reply_text += f"⏱️ You have **{int(value)} active minutes** today.\n"

    elif agent == "second_brain_agent":
        try:
            reply_text += process_second_brain_action(params, supabase, user_id, client)
        except Exception as e:
            logger.error(f"[Second Brain Agent] Error: {e}")
            reply_text += f"❌ Second Brain Error: {e}\n"
    
    elif agent == "second_brain_query_agent":
        try:
            reply_text += process_second_brain_query_action(params, supabase, user_id, client)
        except Exception as e:
            logger.error(f"[Second Brain Query Agent] Error: {e}")
            reply_text += f"❌ Second Brain Query Error: {e}\n"

    else:
        logger.warning(f"[Router Warning] Unsupported agent invoked: {agent}")
        reply_text += f"⚠️ {agent} detected, but I haven't built the Python logic for it yet!\n"

    return reply_text.strip()
