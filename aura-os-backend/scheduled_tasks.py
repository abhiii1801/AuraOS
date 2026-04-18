import logging
from datetime import datetime, timedelta
from telegram_utils import send_telegram_message
from info_agent import fetch_personalized_news

logger = logging.getLogger("AuraOS.ScheduledTasks")

# Currently hardcoded to the specific test chat ID, consider fetching from DB
MY_CHAT_ID = 1725513612

async def check_daily_bills(supabase):
    """Runs once a day to check if any bills are due tomorrow."""
    logger.info("Checking subscriptions...")
    
    # What day is tomorrow?
    tomorrow = datetime.now() + timedelta(days=1)
    target_day = tomorrow.day
    
    try:
        # Fetch all active subs due tomorrow from Supabase
        response = supabase.table("subscriptions").select("*").eq("billing_day", target_day).execute()
        subs_due_tomorrow = response.data
        
        for sub in subs_due_tomorrow:
            msg = f"🔔 SUBSCRIPTION ALERT: Your ₹{sub['amount']} bill for {sub['name']} is due tomorrow!"
            send_telegram_message(MY_CHAT_ID, msg)
            
    except Exception as e:
         logger.error(f"Failed to check bills: {e}")

async def send_morning_digest(supabase):
    """Runs at 8:00 AM to give you your news and bills."""
    # 1. Get News
    interests = ["FastAPI", "PostgreSQL", "OpenAI", "Stock Market India"]
    news_brief = fetch_personalized_news(interests)
    
    # 2. Daily Bills checking
    await check_daily_bills(supabase)
    
    digest_msg = f"☀️ **Good Morning, Abhinav!**\n\n**Your Daily News Briefing:**\n\n{news_brief}"
    send_telegram_message(MY_CHAT_ID, digest_msg)
