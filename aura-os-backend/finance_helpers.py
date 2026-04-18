import logging
from datetime import datetime, date, timedelta

logger = logging.getLogger("AuraOS.FinanceHelpers")

def _get_date_range(filter_str: str):
    """Parses filter strings into (start_iso, end_iso) where end_iso might be None."""
    now = datetime.now()
    if filter_str == "This Week":
        start = (now - timedelta(days=now.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
        return start.isoformat(), None
    elif filter_str == "Last Month":
        first_of_this = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        last_of_last = first_of_this - timedelta(days=1)
        start = last_of_last.replace(day=1)
        end = last_of_last.replace(hour=23, minute=59, second=59, microsecond=999999)
        return start.isoformat(), end.isoformat()
    elif filter_str == "All Time":
        return None, None
    elif filter_str == "Current Month":
        start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        return start.isoformat(), None
    else:
        try:
            d = datetime.strptime(filter_str, "%Y-%m")
            start = d.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            if start.month == 12:
                next_month = start.replace(year=start.year + 1, month=1)
            else:
                next_month = start.replace(month=start.month + 1)
            end = next_month - timedelta(microseconds=1)
            return start.isoformat(), end.isoformat()
        except Exception:
            start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            return start.isoformat(), None


def get_mtd_spent(supabase, user_id: str, start_iso: str = None, end_iso: str = None, raw_data: list = None) -> float:
    """Total debit spend for the given date range."""
    try:
        if raw_data is not None:
            valid = [r for r in raw_data if r.get("transaction_type") == "debit"]
            if start_iso: valid = [r for r in valid if (r.get("transaction_date") or "") >= start_iso]
            if end_iso: valid = [r for r in valid if (r.get("transaction_date") or "") <= end_iso]
            return round(sum(r.get("amount", 0) for r in valid), 2)
            
        query = supabase.table("expenses").select("amount").eq("user_id", user_id).eq("transaction_type", "debit")
        if start_iso: query = query.gte("transaction_date", start_iso)
        if end_iso: query = query.lte("transaction_date", end_iso)
        res = query.execute()
        return round(sum(r["amount"] for r in res.data if r.get("amount")), 2)
    except Exception as e:
        logger.error(f"get_mtd_spent: {e}")
        return 0.0


def get_total_income(supabase, user_id: str, start_iso: str = None, end_iso: str = None, raw_data: list = None) -> float:
    """Total credit (income) for the given date range."""
    try:
        if raw_data is not None:
            valid = [r for r in raw_data if r.get("transaction_type") == "credit"]
            if start_iso: valid = [r for r in valid if (r.get("transaction_date") or "") >= start_iso]
            if end_iso: valid = [r for r in valid if (r.get("transaction_date") or "") <= end_iso]
            return round(sum(r.get("amount", 0) for r in valid), 2)
            
        query = supabase.table("expenses").select("amount").eq("user_id", user_id).eq("transaction_type", "credit")
        if start_iso: query = query.gte("transaction_date", start_iso)
        if end_iso: query = query.lte("transaction_date", end_iso)
        res = query.execute()
        return round(sum(r["amount"] for r in res.data if r.get("amount")), 2)
    except Exception as e:
        logger.error(f"get_total_income: {e}")
        return 0.0


def get_top_category(supabase, user_id: str, start_iso: str = None, end_iso: str = None, raw_data: list = None) -> str:
    """Category with the highest debit spend for the given date range."""
    try:
        totals: dict = {}
        if raw_data is not None:
            valid = [r for r in raw_data if r.get("transaction_type") == "debit"]
            if start_iso: valid = [r for r in valid if (r.get("transaction_date") or "") >= start_iso]
            if end_iso: valid = [r for r in valid if (r.get("transaction_date") or "") <= end_iso]
            if not valid:
                return "N/A"
            for row in valid:
                cat = row.get("category") or "Other"
                totals[cat] = totals.get(cat, 0) + (row.get("amount") or 0)
        else:
            query = supabase.table("expenses").select("category, amount").eq("user_id", user_id).eq("transaction_type", "debit")
            if start_iso: query = query.gte("transaction_date", start_iso)
            if end_iso: query = query.lte("transaction_date", end_iso)
            res = query.execute()
            if not res.data:
                return "N/A"
            for row in res.data:
                cat = row.get("category") or "Other"
                totals[cat] = totals.get(cat, 0) + (row.get("amount") or 0)
                
        return max(totals, key=totals.get) if totals else "N/A"
    except Exception as e:
        logger.error(f"get_top_category: {e}")
        return "N/A"


def get_transactions(supabase, user_id: str, start_iso: str = None, end_iso: str = None, limit: int = 40, raw_data: list = None) -> list:
    """Recent transactions, most-recent first."""
    try:
        if raw_data is not None:
            valid = raw_data
            if start_iso: valid = [r for r in valid if (r.get("transaction_date") or "") >= start_iso]
            if end_iso: valid = [r for r in valid if (r.get("transaction_date") or "") <= end_iso]
            
            # Sort by transaction_date descending
            valid.sort(key=lambda x: x.get("transaction_date") or "", reverse=True)
            valid = valid[:limit]
            
            return [
                {
                    "id": str(r["id"]),
                    "amount": r.get("amount", 0),
                    "category": r.get("category", "Other"),
                    "merchant": r.get("merchant", "Unknown"),
                    "date": r["transaction_date"][:10] if r.get("transaction_date") else None,
                    "transaction_type": r.get("transaction_type", "debit"),
                }
                for r in valid
            ]
            
        query = supabase.table("expenses").select("id, amount, category, merchant, transaction_date, transaction_type").eq("user_id", user_id)
        if start_iso: query = query.gte("transaction_date", start_iso)
        if end_iso: query = query.lte("transaction_date", end_iso)
        res = query.order("transaction_date", desc=True).limit(limit).execute()
        return [
            {
                "id": str(r["id"]),
                "amount": r.get("amount", 0),
                "category": r.get("category", "Other"),
                "merchant": r.get("merchant", "Unknown"),
                "date": r["transaction_date"][:10] if r.get("transaction_date") else None,
                "transaction_type": r.get("transaction_type", "debit"),
            }
            for r in res.data
        ]
    except Exception as e:
        logger.error(f"get_transactions: {e}")
        return []


def get_category_breakdown(supabase, user_id: str, start_iso: str = None, end_iso: str = None, raw_data: list = None) -> list:
    """Per-category debit spending totals for the range."""
    try:
        totals: dict = {}
        if raw_data is not None:
            valid = [r for r in raw_data if r.get("transaction_type") == "debit"]
            if start_iso: valid = [r for r in valid if (r.get("transaction_date") or "") >= start_iso]
            if end_iso: valid = [r for r in valid if (r.get("transaction_date") or "") <= end_iso]
            for row in valid:
                cat = row.get("category") or "Other"
                totals[cat] = totals.get(cat, 0) + (row.get("amount") or 0)
        else:
            query = supabase.table("expenses").select("category, amount").eq("user_id", user_id).eq("transaction_type", "debit")
            if start_iso: query = query.gte("transaction_date", start_iso)
            if end_iso: query = query.lte("transaction_date", end_iso)
            res = query.execute()
            for row in res.data:
                cat = row.get("category") or "Other"
                totals[cat] = totals.get(cat, 0) + (row.get("amount") or 0)
        
        result = [{"name": cat, "value": round(val, 2)} for cat, val in totals.items()]
        result.sort(key=lambda x: x["value"], reverse=True)
        return result
    except Exception as e:
        logger.error(f"get_category_breakdown: {e}")
        return []


def get_subscriptions(supabase, user_id: str) -> list:
    """Active subscriptions with a computed next_billing date (YYYY-MM-DD)."""
    try:
        res = (
            supabase.table("subscriptions")
            .select("name, amount, billing_day")
            .eq("user_id", user_id)
            .eq("is_active", True)
            .execute()
        )
        today = date.today()
        result = []
        for row in res.data:
            bd = int(row.get("billing_day", 1))
            try:
                nb = date(today.year, today.month, bd)
                if nb < today:
                    if today.month == 12:
                        nb = date(today.year + 1, 1, bd)
                    else:
                        nb = date(today.year, today.month + 1, bd)
            except ValueError:
                nb = None
            result.append({
                "name": row.get("name", "Unknown"),
                "amount": row.get("amount", 0),
                "next_billing": str(nb) if nb else None,
            })
        return result
    except Exception as e:
        logger.error(f"get_subscriptions: {e}")
        return []


def get_chart_data(supabase, user_id: str, start_iso: str = None, end_iso: str = None, raw_data: list = None) -> list:
    """Daily debit totals for the given range, sorted chronologically."""
    try:
        daily: dict = {}
        if raw_data is not None:
            valid = [r for r in raw_data if r.get("transaction_type") == "debit"]
            if start_iso: valid = [r for r in valid if (r.get("transaction_date") or "") >= start_iso]
            if end_iso: valid = [r for r in valid if (r.get("transaction_date") or "") <= end_iso]
            for row in valid:
                d_str = row["transaction_date"][:10] if row.get("transaction_date") else None
                if d_str:
                    daily[d_str] = daily.get(d_str, 0) + (row.get("amount") or 0)
        else:
            query = supabase.table("expenses").select("amount, transaction_date").eq("user_id", user_id).eq("transaction_type", "debit")
            if start_iso: query = query.gte("transaction_date", start_iso)
            if end_iso: query = query.lte("transaction_date", end_iso)
            res = query.execute()
            for row in res.data:
                d_str = row["transaction_date"][:10] if row.get("transaction_date") else None
                if d_str:
                    daily[d_str] = daily.get(d_str, 0) + (row.get("amount") or 0)

        result = []
        for d_str in sorted(daily):
            d = datetime.strptime(d_str, "%Y-%m-%d")
            result.append({
                "date": f"{d.strftime('%b')} {d.day}",   # e.g. "Apr 7"
                "spent": round(daily[d_str], 2),
            })
        return result
    except Exception as e:
        logger.error(f"get_chart_data: {e}")
        return []
