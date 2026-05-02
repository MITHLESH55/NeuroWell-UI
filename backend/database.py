from pymongo import MongoClient
import os
import urllib.parse
from dotenv import load_dotenv

load_dotenv()

# Extract credentials
username = os.getenv("MONGO_USERNAME", "neurowell")
password = os.getenv("MONGO_PASSWORD", "NeuroWell112")
cluster = os.getenv("MONGO_CLUSTER", "cluster0.jisypjd.mongodb.net")
db_name = os.getenv("MONGO_DB", "neuro-well")

# Encode credentials using quote_plus for special characters
encoded_username = urllib.parse.quote_plus(username)
encoded_password = urllib.parse.quote_plus(password)

# Load URI template from .env
mongo_uri_template = os.getenv("MONGO_URI")

if mongo_uri_template and "{username}" in mongo_uri_template:
    MONGO_URI = mongo_uri_template.format(
        username=encoded_username, 
        password=encoded_password, 
        cluster=cluster, 
        db=db_name
    )
elif mongo_uri_template:
    MONGO_URI = mongo_uri_template
else:
    MONGO_URI = f"mongodb+srv://{encoded_username}:{encoded_password}@{cluster}/{db_name}?retryWrites=true&w=majority"

# Debug print to confirm URI is loaded without exposing password
safe_uri = MONGO_URI.replace(encoded_password, "*****")
print(f"INFO: Loaded MONGO_URI: {safe_uri}")

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    # Ping the server to check if connection is successful
    client.admin.command('ping')
    db = client[db_name]
    users_collection = db["users"]
    health_collection = db["health_data"]
    print(f"INFO: MongoDB Connected Successfully to database: {db_name}")
except Exception as e:
    print("ERROR: MongoDB Connection Failed:", e)
    db = None
    users_collection = None
    health_collection = None
