import asyncio
import time
import logging
from telegram_utils import send_telegram_message

logger = logging.getLogger("AuraOS.ReminderAgent")

async def async_telegram_reminder(chat_id: int, delay_seconds: int, reminder_text: str):
    """Sleeps in the background, then sends a Telegram message."""
    await asyncio.sleep(delay_seconds)
    send_telegram_message(chat_id, f"🔔 REMINDER: {reminder_text}")
    logger.info("[Reminder Agent] Reminder sent to user.")

def process_reminder_action(params, chat_id, background_tasks, message_sent_timestamp):
    reminder_msg = params.get("message")
    delay_minutes = int(params.get("delay_minutes", 0))
    
    # 1. When exactly should this reminder fire? 
    target_timestamp = message_sent_timestamp + (delay_minutes * 60)
    
    # 2. What time is it right now on the server?
    current_timestamp = int(time.time())
    
    # 3. How many seconds are actually left?
    actual_delay_seconds = target_timestamp - current_timestamp
    
    if actual_delay_seconds < 0:
        actual_delay_seconds = 0
    
    # Tell FastAPI to sleep
    background_tasks.add_task(async_telegram_reminder, chat_id, actual_delay_seconds, reminder_msg)
    
    return "⏱️ Got it. I've synced the timer to exactly when you hit send.\n"
