import re

def process_subscription_action(params, supabase, user_id):
    """Processes a subscription insert action."""
    sub_name = params.get("name", "Unknown Sub")
    
    raw_amount = str(params.get("amount", "0"))
    clean_amount = re.sub(r'[^\d.]', '', raw_amount)
    amount = float(clean_amount) if clean_amount else 0.0
    
    billing_day = int(params.get("billing_day", 1))

    # Save it to the Supabase table
    supabase.table("subscriptions").insert({
        "user_id": user_id,
        "name": sub_name,
        "amount": amount,
        "billing_day": billing_day,
        "is_active": True
    }).execute()

    return f"🔄 Got it. I'll remind you about your ₹{amount} {sub_name} bill on the {billing_day}th of every month.\n"
