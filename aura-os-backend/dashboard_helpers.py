import logging
from datetime import datetime, date, timedelta
from finance_helpers import get_subscriptions, get_top_category, get_mtd_spent, _get_date_range

logger = logging.getLogger("AuraOS.DashboardHelpers")

def generate_briefing(name: str, upcoming_events: list, subscriptions: list) -> str:
    """Builds a short, personalised dashboard greeting string."""
    hour = datetime.now().hour
    if hour < 12:
        greeting = "Good morning"
    elif hour < 17:
        greeting = "Good afternoon"
    else:
        greeting = "Good evening"

    parts = [f"{greeting} {name}."]

    if upcoming_events:
        n = len(upcoming_events)
        parts.append(f"You have {n} meeting{'s' if n > 1 else ''} today.")

    # Subscriptions renewing tomorrow
    tomorrow = date.today() + timedelta(days=1)
    subs_due = [s for s in subscriptions if s.get("next_billing") == str(tomorrow)]
    for sub in subs_due[:2]:   # Cap at 2 to keep the briefing concise
        parts.append(f"Your {sub['name']} subscription renews tomorrow.")

    return " ".join(parts)


def generate_insights(user_id: str, supabase) -> list:
    """Generates real-time structural insights for the dashboard."""
    insights = []
    try:
        # 1. Subscriptions Check
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
        
    return insights
