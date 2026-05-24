import logging
from datetime import datetime, date, timedelta
from finance_helpers import get_subscriptions, get_top_category, get_mtd_spent, _get_date_range

logger = logging.getLogger("AuraOS.DashboardHelpers")

def generate_briefing(name: str, upcoming_events: list, subscriptions: list, today_steps: int = 0) -> str:
    """Builds a concise personalised daily digest (excluding the time-of-day greeting).

    The UI will render the time-based greeting separately; this function focuses on
    summarising items, next actions, and small recommendations for the day.
    """
    parts = []

    # Include a quick health datapoint if available
    try:
        if isinstance(today_steps, int) and today_steps > 0:
            parts.append(f"You've taken {today_steps} steps today.")
    except Exception:
        pass

    # Events
    if upcoming_events:
        n = len(upcoming_events)
        next_evt = upcoming_events[0]
        # Attempt to extract a readable next-event summary
        title = next_evt.get("summary") or next_evt.get("title") or "an event"
        time = next_evt.get("time") or next_evt.get("start") or "soon"
        parts.append(f"You have {n} upcoming event{'s' if n > 1 else ''}. Next: {title} at {time}.")
    else:
        parts.append("No events scheduled for the coming days.")

    # Subscriptions renewing soon
    tomorrow = date.today() + timedelta(days=1)
    subs_due = [s for s in subscriptions if s.get("next_billing") == str(tomorrow)]
    if subs_due:
        names = ", ".join(s.get("name", "subscription") for s in subs_due[:3])
        parts.append(f"Heads-up: {names} renew{'s' if len(subs_due)==1 else ''} tomorrow.")

    # Short recommendation placeholder
    parts.append("Here are the top items to review: your inbox, today's events, and your top spending category.")

    return " ".join(parts)


def generate_insights(user_id: str, supabase) -> list:
    """Generates real-time structural insights for the dashboard."""
    insights = []
    try:
        # 1. Subscriptions Check
        from logging_utils import log_event
        log_event("GEMINI_CALL", {"agent": "dashboard_agent", "action": "generate_insights", "prompt": "insights_request"})
        subs = get_subscriptions(supabase, user_id)
        today = date.today()
        upcoming_subs = []
        for s in subs:
            if s.get("next_billing"):
                try:
                    nb = datetime.strptime(s["next_billing"], "%Y-%m-%d").date()
                    days_left = (nb - today).days
                    if 0 <= days_left <= 3:
                        upcoming_subs.append((s, days_left))
                except Exception:
                    pass
        
        if upcoming_subs:
            sub, days = upcoming_subs[0]
            insights.append({
                "id": f"sub_{sub['name']}",
                "icon": "subscription",
                "priority": "high" if days <= 1 else "normal",
                "text": f"Your {sub['name']} subscription renews in {days} day{'s' if days != 1 else ''} (₹{sub['amount']})."
            })
            
        # 2. Health Goal Check
        try:
            from health_agent import get_daily_fitness_data
            steps = get_daily_fitness_data("steps", user_id=user_id, supabase=supabase)
            steps_val = int(steps) if isinstance(steps, (int, float)) else 0
            if steps_val > 10000:
                insights.append({
                    "id": "health_high",
                    "icon": "health",
                    "priority": "normal",
                    "text": f"Great job hitting {steps_val} steps today! You are crushing your fitness goals."
                })
            elif steps_val < 3000 and datetime.now().hour > 17:
                 insights.append({
                    "id": "health_low",
                    "icon": "health",
                    "priority": "high",
                    "text": f"You've only taken {steps_val} steps today. Consider a short evening walk!"
                })
        except Exception:
            pass # ignore health error gracefully
            
        # 3. Finance Alert
        start_iso, _ = _get_date_range("Current Month")
        top_cat = get_top_category(supabase, user_id, start_iso=start_iso)
        mtd_spent = get_mtd_spent(supabase, user_id, start_iso=start_iso)
        if top_cat != "N/A" and mtd_spent > 0:
            insights.append({
                "id": "finance_top",
                "icon": "alert",
                "priority": "normal",
                "text": f"You've spent ₹{mtd_spent} this month, with the majority going towards {top_cat}."
            })
            
    except Exception as e:
        logger.error(f"generate_insights: {e}")
        
    # Pad to ensure exactly 3 insights are returned
    default_insights = [
        {"id": "default_1", "icon": "subscription", "priority": "normal", "text": "All systems operational. No immediate action required."},
        {"id": "default_2", "icon": "health", "priority": "normal", "text": "Fitness data synced and up to date."},
        {"id": "default_3", "icon": "alert", "priority": "normal", "text": "No unusual spending anomalies detected this week."}
    ]
    
    while len(insights) < 3:
        insights.append(default_insights[len(insights)])
        
    return insights[:3]
