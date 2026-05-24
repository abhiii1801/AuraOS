import os
import logging
import requests
from google_auth import get_db_credentials
from googleapiclient.discovery import build
import base64

logger = logging.getLogger("AuraOS.InfoHelpers")


# ---------------------------------------------------------------------------
# NEWS
# ---------------------------------------------------------------------------

def get_news_headlines(interests: list = None, count: int = 8) -> list:
    """Fetch news headlines with title, description, url, and image thumbnail."""
    api_key = os.environ.get("NEWS_API_KEY")
    if not api_key:
        logger.warning("NEWS_API_KEY not configured")
        return []

    if interests is None:
        interests = ["Tech", "AI", "India", "Startups"]

    seen_urls = set()
    articles = []

    # Fetch interest-specific articles
    for topic in interests:
        if len(articles) >= count:
            break
        try:
            params = {
                "q": topic,
                "language": "en",
                "pageSize": max(1, (count // len(interests)) + 1),
                "sortBy": "publishedAt",
                "apiKey": api_key,
            }
            resp = requests.get("https://newsapi.org/v2/everything", params=params, timeout=5).json()
            for art in resp.get("articles", []):
                url = art.get("url", "")
                title = art.get("title", "")
                if not url or not title or url in seen_urls:
                    continue
                if "[Removed]" in title:
                    continue
                seen_urls.add(url)
                articles.append({
                    "title": title,
                    "description": art.get("description") or "",
                    "url": url,
                    "image": art.get("urlToImage") or "",
                    "source": art.get("source", {}).get("name", "Unknown"),
                    "published_at": art.get("publishedAt", ""),
                    "topic": topic,
                })
        except Exception as e:
            logger.error(f"News fetch error for topic '{topic}': {e}")

    # Fallback to top headlines if sparse
    if len(articles) < 4:
        try:
            params = {
                "country": "in",
                "pageSize": count,
                "apiKey": api_key,
            }
            resp = requests.get("https://newsapi.org/v2/top-headlines", params=params, timeout=5).json()
            for art in resp.get("articles", []):
                url = art.get("url", "")
                title = art.get("title", "")
                if not url or not title or url in seen_urls:
                    continue
                if "[Removed]" in title:
                    continue
                seen_urls.add(url)
                articles.append({
                    "title": title,
                    "description": art.get("description") or "",
                    "url": url,
                    "image": art.get("urlToImage") or "",
                    "source": art.get("source", {}).get("name", "Unknown"),
                    "published_at": art.get("publishedAt", ""),
                    "topic": "Top Headlines",
                })
        except Exception as e:
            logger.error(f"Fallback news fetch error: {e}")

    return articles[:count]


# ---------------------------------------------------------------------------
# GMAIL
# ---------------------------------------------------------------------------

def _parse_email_headers(headers: list):
    subject = "No Subject"
    sender = "Unknown"
    date = ""
    for h in headers:
        name = h.get("name", "")
        if name == "Subject":
            subject = h.get("value", "No Subject")
        elif name == "From":
            sender = h.get("value", "Unknown")
        elif name == "Date":
            date = h.get("value", "")
    return subject, sender, date


def get_recent_emails_structured(user_id: str, supabase, max_results: int = 8) -> list:
    """Returns a list of structured recent inbox emails (not just unread)."""
    try:
        creds = get_db_credentials(user_id, supabase)
        service = build("gmail", "v1", credentials=creds)

        results = service.users().messages().list(
            userId="me",
            labelIds=["INBOX"],
            q="category:primary",
            maxResults=max_results
        ).execute()

        messages = results.get("messages", [])
        if not messages:
            return []

        emails = []
        for msg in messages:
            txt = service.users().messages().get(userId="me", id=msg["id"], format="metadata",
                                                  metadataHeaders=["Subject", "From", "Date"]).execute()
            subject, sender, date = _parse_email_headers(txt.get("payload", {}).get("headers", []))
            snippet = txt.get("snippet", "")
            labels = txt.get("labelIds", [])
            is_unread = "UNREAD" in labels

            # Parse sender display name vs email
            sender_name = sender
            sender_email = sender
            if "<" in sender:
                parts = sender.split("<")
                sender_name = parts[0].strip().strip('"')
                sender_email = parts[1].rstrip(">").strip()

            emails.append({
                "id": msg["id"],
                "subject": subject,
                "sender_name": sender_name,
                "sender_email": sender_email,
                "snippet": snippet,
                "date": date,
                "is_unread": is_unread,
            })

        return emails
    except Exception as e:
        logger.error(f"Gmail fetch error: {e}")
        return []


def get_email_ai_summary(emails: list, genai_client) -> str:
    """Runs a compact, structured Gemini summarization pass over the email list."""
    if not emails:
        return "Your inbox is empty or unavailable."
    try:
        raw = "\n\n".join(
            f"From: {e['sender_name']} <{e['sender_email']}>\nSubject: {e['subject']}\nPreview: {e['snippet']}"
            for e in emails[:6]
        )
        prompt = (
            "You are my sharp executive assistant. Summarize these recent emails in 3-5 concise bullet points. "
            "Flag anything that looks urgent or needs my action. "
            "Output EXCLUSIVELY as a valid JSON array of objects. Do not use markdown blocks. Each object must have two properties:\n"
            "- 'text' (string): The summary text.\n"
            "- 'is_urgent' (boolean): True if the email requires urgent action, false otherwise.\n\n"
            f"Emails:\n{raw}"
        )
        from logging_utils import log_event
        log_event("GEMINI_CALL", {"agent": "info_agent", "action": "email_summary", "prompt": prompt})
        
        resp = genai_client.models.generate_content(model="gemini-2.5-flash", contents=prompt)
        text = resp.text.strip()
        
        log_event("GEMINI_RESPONSE", {"agent": "info_agent", "action": "email_summary", "raw_output": text})
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        return text.strip()
    except Exception as e:
        logger.error(f"Email summary AI error: {e}")
        return "[]"


# ---------------------------------------------------------------------------
# YOUTUBE SUBSCRIPTION FEED
# ---------------------------------------------------------------------------

def get_subscription_videos(user_id: str, supabase, max_channels: int = 5, videos_per_channel: int = 1) -> list:
    """
    Fetches the most recent video from each of the user's top subscriptions.
    YouTube API doesn't expose a simple 'my feed' endpoint, so we
    list subscriptions then search each channel for its latest video.
    """
    try:
        creds = get_db_credentials(user_id, supabase)
        youtube = build("youtube", "v3", credentials=creds)

        # 1. Get user's subscriptions
        subs_resp = youtube.subscriptions().list(
            part="snippet",
            mine=True,
            maxResults=max_channels,
            order="relevance"
        ).execute()

        channels = []
        for item in subs_resp.get("items", []):
            snippet = item.get("snippet", {})
            ch_id = snippet.get("resourceId", {}).get("channelId")
            ch_name = snippet.get("title", "Unknown Channel")
            ch_thumb = snippet.get("thumbnails", {}).get("default", {}).get("url", "")
            if ch_id:
                channels.append({"id": ch_id, "name": ch_name, "thumb": ch_thumb})

        if not channels:
            return []

        # 2. For each channel, fetch the latest video
        videos = []
        for ch in channels[:max_channels]:
            try:
                search_resp = youtube.search().list(
                    part="snippet",
                    channelId=ch["id"],
                    order="date",
                    type="video",
                    maxResults=videos_per_channel
                ).execute()

                for item in search_resp.get("items", []):
                    vid_id = item.get("id", {}).get("videoId")
                    if not vid_id:
                        continue
                    snippet = item.get("snippet", {})
                    thumbnails = snippet.get("thumbnails", {})
                    thumb_url = (
                        thumbnails.get("maxres", {}).get("url")
                        or thumbnails.get("high", {}).get("url")
                        or thumbnails.get("medium", {}).get("url")
                        or thumbnails.get("default", {}).get("url")
                        or ""
                    )
                    videos.append({
                        "video_id": vid_id,
                        "title": snippet.get("title", "Unknown"),
                        "channel_name": ch["name"],
                        "channel_thumb": ch["thumb"],
                        "thumbnail": thumb_url,
                        "url": f"https://www.youtube.com/watch?v={vid_id}",
                        "published_at": snippet.get("publishedAt", ""),
                        "description": snippet.get("description", "")[:120],
                    })
            except Exception as e:
                logger.warning(f"YouTube video fetch error for channel {ch['id']}: {e}")
                continue

        # Enrich videos with duration and view count in a single batch call
        try:
            vid_ids = ",".join(v["video_id"] for v in videos)
            if vid_ids:
                stats_resp = youtube.videos().list(part="contentDetails,statistics", id=vid_ids).execute()
                stats_map = {}
                for it in stats_resp.get("items", []):
                    vid = it.get("id")
                    cd = it.get("contentDetails", {})
                    st = it.get("statistics", {})
                    duration = cd.get("duration", "PT0M")
                    # Convert ISO 8601 duration to human-friendly (simple parser)
                    import re
                    m = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", duration)
                    if m:
                        hours = int(m.group(1) or 0)
                        mins = int(m.group(2) or 0)
                        secs = int(m.group(3) or 0)
                        if hours:
                            dur_str = f"{hours}h {mins}m"
                        else:
                            dur_str = f"{mins}m {secs}s" if mins else f"{secs}s"
                    else:
                        dur_str = "--"

                    views = st.get("viewCount") or "--"
                    stats_map[vid] = {"duration": dur_str, "views": views}

                for v in videos:
                    s = stats_map.get(v["video_id"], {})
                    v["duration"] = s.get("duration", "--")
                    v["views"] = s.get("views", "--")
        except Exception:
            # If enrichment fails, just continue with the basic data
            for v in videos:
                v.setdefault("duration", "--")
                v.setdefault("views", "--")

        return videos

    except Exception as e:
        logger.error(f"YouTube subscriptions fetch error: {e}")
        return []
