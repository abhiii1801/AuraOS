import os
from dotenv import load_dotenv
from supabase import create_client, Client
from health_agent import get_daily_fitness_data, get_weekly_fitness_data

load_dotenv()
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

user_id = "fcd12ca0-df51-4e79-880d-8df5bafdb220" # wait, I don't know the user id, I'll need to fetch the first user

users = supabase.table("users").select("*").execute()
if users.data:
    user = users.data[0]
    user_id = user["id"]
    print(f"Testing for user {user['email']} ({user_id})")
    
    steps = get_daily_fitness_data("steps", user_id=user_id, supabase=supabase)
    print(f"Steps: {steps}")
    
    sleep = get_daily_fitness_data("sleep", user_id=user_id, supabase=supabase)
    print(f"Sleep: {sleep}")
    
    hr = get_daily_fitness_data("heart_rate", user_id=user_id, supabase=supabase)
    print(f"Heart Rate: {hr}")
else:
    print("No users found")
