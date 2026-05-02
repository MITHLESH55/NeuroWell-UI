import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
print(f"Connecting to: {MONGO_URI.split('@')[-1]}") # Print only the host part for safety

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    # The ismaster command is cheap and does not require auth.
    client.admin.command('ismaster')
    print("✅ MongoDB Connection Successful!")
except Exception as e:
    print(f"❌ MongoDB Connection Failed: {e}")
