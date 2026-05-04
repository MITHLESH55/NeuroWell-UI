from fastapi import APIRouter, HTTPException, Body
from fastapi.responses import JSONResponse
from datetime import datetime
from database import users_collection
from services.auth_service import AuthService
from pymongo.errors import PyMongoError

router = APIRouter()

@router.post("/register")
async def register(user_data: dict = Body(...)):
    print(f"DEBUG: Received registration request for: {user_data.get('email')}")
    try:
        if users_collection is None:
            print("ERROR: Database connection is not established.")
            return JSONResponse(status_code=500, content={"success": False, "message": "Database connection error"})

        email = user_data.get("email")
        password = user_data.get("password")
        full_name = user_data.get("fullName") or user_data.get("name")

        if not email or not password:
            print("DEBUG: Registration failed - missing email or password")
            return JSONResponse(status_code=400, content={"success": False, "message": "Email and password required"})

        # Check if user exists using find_one
        existing_user = users_collection.find_one({"email": email})
        if existing_user:
            print(f"DEBUG: Registration failed - email {email} already exists")
            return JSONResponse(status_code=400, content={"success": False, "message": "Email already registered"})

        hashed_pw = AuthService.hash_password(password)
        user_obj = {
            "email": email,
            "name": full_name,
            "password": hashed_pw,
            "createdAt": datetime.utcnow()
        }
        
        # Insert user using insert_one
        result = users_collection.insert_one(user_obj)
        print(f"DEBUG: User registered successfully with ID: {result.inserted_id}")
        
        token = AuthService.create_access_token({"email": email, "id": str(result.inserted_id)})
        
        return {
            "success": True,
            "message": "User registered successfully",
            "token": token,
            "user": {
                "email": email, 
                "name": full_name,
                "id": str(result.inserted_id)
            }
        }
    except PyMongoError as e:
        print(f"ERROR: MongoDB operation failed during registration: {e}")
        return JSONResponse(status_code=500, content={"success": False, "message": "Database error occurred"})
    except Exception as e:
        print(f"ERROR: Unexpected error during registration: {e}")
        return JSONResponse(status_code=500, content={"success": False, "message": "Internal server error"})

@router.post("/login")
async def login(credentials: dict = Body(...)):
    print(f"DEBUG: Received login request for: {credentials.get('email')}")
    try:
        if users_collection is None:
            print("ERROR: Database connection is not established.")
            return JSONResponse(status_code=500, content={"success": False, "message": "Database connection error"})

        email = credentials.get("email")
        password = credentials.get("password")

        if not email or not password:
            print("DEBUG: Login failed - missing email or password")
            return JSONResponse(status_code=400, content={"success": False, "message": "Email and password required"})

        user = users_collection.find_one({"email": email})
        if not user:
            print(f"DEBUG: Login failed - user {email} not found")
            return JSONResponse(status_code=404, content={"success": False, "message": "User not found"})

        if not AuthService.verify_password(password, user["password"]):
            print(f"DEBUG: Login failed - invalid password for {email}")
            return JSONResponse(status_code=401, content={"success": False, "message": "Invalid password"})

        print(f"DEBUG: Login successful for {email}")
        token = AuthService.create_access_token({"email": email, "id": str(user["_id"])})
        
        return {
            "success": True,
            "message": "Login successful",
            "token": token,
            "user": {
                "email": email, 
                "name": user.get("name") or user.get("fullName"),
                "id": str(user["_id"])
            }
        }
    except PyMongoError as e:
        print(f"ERROR: MongoDB operation failed during login: {e}")
        return JSONResponse(status_code=500, content={"success": False, "message": "Database error occurred"})
    except Exception as e:
        print(f"ERROR: Unexpected error during login: {e}")
        return JSONResponse(status_code=500, content={"success": False, "message": "Internal server error"})
