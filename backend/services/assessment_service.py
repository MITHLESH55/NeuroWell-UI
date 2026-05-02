from datetime import datetime
from database import health_collection

def save_assessment_data(data: dict):
    """Save assessment data to MongoDB."""
    data["timestamp"] = datetime.utcnow()
    result = health_collection.insert_one(data)
    return str(result.inserted_id)