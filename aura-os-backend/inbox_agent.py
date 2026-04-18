from google_auth import get_db_credentials
from googleapiclient.discovery import build

def get_gmail_service(user_id, supabase):
    creds = get_db_credentials(user_id, supabase)
    return build('gmail', 'v1', credentials=creds)

def get_unread_emails(user_id, supabase, max_results=5):
    """Fetches the subjects and senders of the latest unread emails."""
    service = get_gmail_service(user_id, supabase)
    try:
        results = service.users().messages().list(userId='me', labelIds=['INBOX', 'UNREAD'], maxResults=max_results).execute()
        messages = results.get('messages', [])
        if not messages:
            return "You have no unread emails. Inbox Zero!"
        email_data = []
        for msg in messages:
            txt = service.users().messages().get(userId='me', id=msg['id']).execute()
            payload = txt['payload']
            headers = payload['headers']
            subject = "No Subject"
            sender = "Unknown Sender"
            for d in headers:
                if d['name'] == 'Subject':
                    subject = d['value']
                if d['name'] == 'From':
                    sender = d['value']
            email_data.append(f"From: {sender}\nSubject: {subject}")
        return "\n\n".join(email_data)
    except Exception as e:
        return f"Gmail API Error: {str(e)}"

def search_emails(query: str, user_id, supabase, max_results=3):
    """Searches Gmail using standard operators."""
    service = get_gmail_service(user_id, supabase)
    try:
        results = service.users().messages().list(userId='me', q=query, maxResults=max_results).execute()
        messages = results.get('messages', [])
        if not messages:
            return "No emails found matching that search."
        email_data = []
        for msg in messages:
            txt = service.users().messages().get(userId='me', id=msg['id']).execute()
            payload = txt['payload']
            headers = payload['headers']
            subject = "No Subject"
            sender = "Unknown Sender"
            for d in headers:
                if d['name'] == 'Subject':
                    subject = d['value']
                if d['name'] == 'From':
                    sender = d['value']
            snippet = txt.get('snippet', 'No body preview available.')
            email_data.append(f"From: {sender}\nSubject: {subject}\nBody Preview: {snippet}")
        return "\n\n".join(email_data)
    except Exception as e:
        return f"Gmail API Error: {str(e)}"

def summarize_with_ai(raw_text: str, genai_client):
    """Passes raw text to Gemini for a quick, human-readable summary."""
    try:
        # We use standard text output here, NOT JSON!
        prompt = f"You are my personal executive assistant. Please provide a brief, friendly summary of these unread emails. Bullet points are great. Call out anything that looks urgent.\n\nRaw Emails:\n{raw_text}"
        
        response = genai_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        return response.text
    except Exception as e:
        return f"Summary failed: {str(e)}"

def draft_email_with_ai(email_context: str, instructions: str, genai_client):
    """Takes an email and user instructions, and writes a professional reply."""
    try:
        prompt = f"""
        You are an expert executive assistant. I need you to draft a professional email reply.
        
        Original Email Context:
        {email_context}
        
        My instructions for the reply: 
        {instructions}
        
        Please write ONLY the final drafted email below. Keep it concise, polite, and professional.
        """
        
        response = genai_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        return response.text
    except Exception as e:
        return f"Drafting failed: {str(e)}"
