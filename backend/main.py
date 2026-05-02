from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# ✅ Load environment variables
load_dotenv()

# ✅ Create FastAPI app
app = FastAPI(title="NeuroWell API")

# ✅ CORS CONFIGURATION
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routers
from routes.auth import router as auth_router
from routes.assessment import router as assessment_router

# Include routers
app.include_router(auth_router, tags=["Authentication"])
app.include_router(assessment_router, tags=["Assessment"])

# ✅ Home and Health Routes
@app.get("/")
def home():
    return {"status": "API working", "message": "NeuroWell Backend Running"}

@app.get("/health")
def health():
    return {"status": "OK"}

@app.get("/get-stripe-link")
def get_stripe_link():
    return {"url": os.getenv("STRIPE_PAYMENT_LINK")}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)