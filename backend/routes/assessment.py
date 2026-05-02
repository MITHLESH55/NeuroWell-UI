from fastapi import APIRouter, HTTPException
from services.assessment_service import save_assessment_data
from database import health_collection

router = APIRouter()

@router.post("/submit-assessment")
async def submit_assessment(data: dict):
    print(f"DEBUG: Received assessment submission for user: {data.get('userId')}")
    try:
        assessment_id = save_assessment_data(data)
        print(f"DEBUG: Assessment saved successfully with ID: {assessment_id}")
        return {
            "success": True,
            "message": "Assessment Saved Successfully",
            "id": assessment_id
        }
    except Exception as e:
        print(f"DEBUG: Assessment submission failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/get-user-data/{user_id}")
async def get_user_data(user_id: str):
    print(f"DEBUG: Fetching data for user: {user_id}")
    try:
        data = health_collection.find_one({"userId": user_id})
        if not data:
            print(f"DEBUG: No data found for user: {user_id}")
            return {"success": False, "message": "No data found"}

        data["_id"] = str(data["_id"])
        print(f"DEBUG: Successfully retrieved data for user: {user_id}")
        return {"success": True, "data": data}
    except Exception as e:
        print(f"DEBUG: Error retrieving user data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))