import os
import psycopg2
import logging

logger = logging.getLogger("AuraOS.FinanceQueryAgent")

def execute_read_query(sql_query: str, user_id: str):
    """Executes a raw SELECT query and returns the fetched data."""
    try:
        db_url = os.environ.get("DATABASE_URL")
        # SECURITY: Force use of the authenticated user's ID via parameterized query
        safe_sql = "WITH user_scope AS (SELECT * FROM expenses WHERE user_id = %s) "
        safe_sql += sql_query.replace("expenses", "user_scope")

        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        if not sql_query.strip().upper().startswith("SELECT"):
            return "Error: Only SELECT queries are allowed for safety."
            
        cursor.execute(safe_sql, (user_id,))
        result = cursor.fetchall()
        
        cursor.close()
        conn.close()
        return result
    except Exception as e:
        logger.error(f"Database Error: {str(e)}")
        return f"Error: Database Error: {str(e)}"

def process_finance_query_action(params, user_id: str):
    sql_query = params.get("sql_query", "")
    context = params.get("conversational_context", "Querying finance database...")
    
    reply_text = f"🔍 {context}\n"
    reply_text += f"💻 Executing: `{sql_query}`\n\n"
    
    db_result = execute_read_query(sql_query, user_id)
    
    if isinstance(db_result, str) and db_result.startswith("Error"):
         reply_text += f"⚠️ {db_result}\n"
    elif not db_result:
         reply_text += "📊 Result: No financial data found for this query.\n"
    else:
         reply_text += f"📊 Result: {str(db_result)}\n"
         
    return reply_text
