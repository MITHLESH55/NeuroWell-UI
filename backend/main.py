from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import stripe
from dotenv import load_dotenv

# ✅ Load environment variables
load_dotenv()

# ✅ Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# ✅ Create FastAPI app
app = FastAPI(title="NeuroWell API")

# ✅ CORS CONFIGURATION
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://mithlesh55.github.io",
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://127.0.0.1:8000",
        "http://localhost:8000",
    ],
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

# ✅ Stripe Checkout Session Endpoint
@app.post("/create-checkout-session")
async def create_checkout_session():
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price": "price_1TT8A7Qwowbd5TD98ONPgWiy",
                    "quantity": 1,
                }
            ],
            mode="payment",
            success_url="https://mithlesh55.github.io/NeuroWell-UI/success.html",
            cancel_url="https://mithlesh55.github.io/NeuroWell-UI/cancel.html",
        )
        return {"url": session.url}
    except Exception as e:
        return {"error": str(e)}

# ✅ Home and Health Routes
@app.get("/")
def home():
    return {"status": "API working", "message": "NeuroWell Backend Running"}

@app.get("/health")
def health():
    return {"status": "OK"}

@app.get("/get-stripe-link")
def get_stripe_link():
    """Legacy route kept for compatibility; returns the same Checkout Session URL."""
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price": "price_1TT8A7Qwowbd5TD98ONPgWiy",
                    "quantity": 1,
                }
            ],
            mode="payment",
            success_url="https://mithlesh55.github.io/NeuroWell-UI/success.html",
            cancel_url="https://mithlesh55.github.io/NeuroWell-UI/cancel.html",
        )
        return {"url": session.url}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)