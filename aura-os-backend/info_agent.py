import os
import requests
from google_auth import get_db_credentials
from googleapiclient.discovery import build

def fetch_personalized_news(interests=None):
    """Fetches news based on a list of interest keywords."""
    if interests is None:
        interests = ["Tech", "AI", "India"]

    api_key = os.environ.get("NEWS_API_KEY")
    news_list = []
    
    for interest in interests:
        params = {
            "q": interest,
            "language": "en",
            "pageSize": 2,
            "sortBy": "relevancy",
            "apiKey": api_key
        }
        response = requests.get("https://newsapi.org/v2/everything", params=params).json()
        for art in response.get("articles", []):
            if art.get("title") and art.get("url"):
                news_list.append(f"📰 {art['title']}\n🔗 {art['url']}")
                
    if not news_list:
        fallback_params = {
            "country": "in",
            "pageSize": 5,
            "apiKey": api_key
        }
        response = requests.get("https://newsapi.org/v2/top-headlines", params=fallback_params).json()
        for art in response.get("articles", []):
            if art.get("title") and art.get("url"):
                news_list.append(f"📰 {art['title']}\n🔗 {art['url']}")
                
    unique_news = list(dict.fromkeys(news_list))[:5]
    return "\n\n".join(unique_news) if unique_news else "No news found today."


def search_youtube_videos(query: str, user_id=None, supabase=None, max_results=3):
    """Searches YouTube for the best videos matching a query using dynamic credentials."""
    creds = get_db_credentials(user_id, supabase)
    youtube = build('youtube', 'v3', credentials=creds)
    
    request = youtube.search().list(
        q=query,
        part='snippet',
        type='video',
        maxResults=max_results
    )
    response = request.execute()
    
    videos = []
    for item in response.get('items', []):
        title = item['snippet']['title']
        video_id = item['id']['videoId']
        videos.append(f"🎥 {title}\n🔗 https://www.youtube.com/watch?v={video_id}")
        
    return "\n\n".join(videos) if videos else "No videos found."
