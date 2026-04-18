import os
import requests
import logging

logger = logging.getLogger("AuraOS.TelegramUtils")

def get_telegram_api_url():
    token = os.environ.get("TELEGRAM_BOT_TOKEN")
    return f"https://api.telegram.org/bot{token}"

def send_telegram_message(chat_id: int, text: str):
    """Utility function to reply to the user on Telegram."""
    url = f"{get_telegram_api_url()}/sendMessage"
    payload = {"chat_id": chat_id, "text": text}
    try:
        requests.post(url, json=payload)
    except Exception as e:
        logger.error(f"Failed to send telegram message: {e}")
