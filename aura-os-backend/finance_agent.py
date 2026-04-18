import re
from datetime import datetime

def process_finance_action(params, supabase, user_id):
    # --- THE SMART FINANCE AGENT LOGIC ---
    raw_amount = str(params.get("amount", "0"))
    clean_amount = re.sub(r'[^\d.]', '', raw_amount)
    amount = float(clean_amount) if clean_amount else 0.0

    # Extract the new smart fields
    t_type = params.get("transaction_type", "debit").lower()
    category = params.get("category", "Other")
    merchant = params.get("merchant", "Unknown")
    notes = params.get("notes", "")
    
    # Get the date, default to right now if AI misses it
    t_date = params.get("transaction_date")
    if not t_date:
         t_date = datetime.now().isoformat()

    # Insert into the updated PostgreSQL table
    supabase.table("expenses").insert({
        "user_id": user_id,
        "amount": amount,
        "category": category,
        "merchant": merchant,
        "transaction_type": t_type,
        "notes": notes,
        "transaction_date": t_date
    }).execute()

    # Format a nice reply based on credit vs debit
    reply_text = ""
    if t_type == 'credit':
        reply_text += f"💰 Received: ₹{amount} from {merchant} ({category}).\n"
    else:
        reply_text += f"📉 Spent: ₹{amount} at {merchant} ({category}).\n"
    
    if notes:
        reply_text += f"   📝 Note: {notes}\n"
        
    return reply_text
