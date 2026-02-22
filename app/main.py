import requests
import uuid
from datetime import datetime
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.core import config  # config.API_KEY
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
# from app.database import engine, SessionLocal, Base
from app import models, crud
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI(title="VTU Reseller Backend")


# -------------------- CORS MIDDLEWARE --------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all devices; replace with your frontend in production
    allow_methods=["*"],  # allow GET, POST, PUT, DELETE
    allow_headers=["*"],  # allow all headers
    allow_credentials=True
)

BASE_URL = "https://remadata.com/api"
HEADERS = {
    "X-API-KEY": config.API_KEY,
    "Content-Type": "application/json"
}

transactions = []


# -------------------- SCHEMAS --------------------

class BuyBundleRequest(BaseModel):
    phone_number: str
    bundle_id: str   # Must match bundle ID from Remadata


class LoadBundleRequest(BaseModel):
    phone_number: str
    amount: float
    network: str


# -------------------- ROOT --------------------

@app.get("/")
def root():
    return {
        "message": "VTU Reseller Backend is running 🚀",
        "endpoints": [
            "/health",
            "/wallet",
            "/bundles",
            "/buy-bundle",
            "/load-bundle",
            "/transactions",
            "/total-profit"
        ]
    }


# -------------------- HEALTH --------------------

@app.get("/health")
def health():
    return {"status": "healthy"}


# -------------------- HELPER FUNCTIONS --------------------

def get_wallet_balance():
    response = requests.get(
        f"{BASE_URL}/wallet-balance",
        headers=HEADERS,
        timeout=10
    )

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return float(response.json()["data"]["balance"])


def get_all_bundles():
    response = requests.get(
        f"{BASE_URL}/bundles",
        headers=HEADERS,
        timeout=10
    )

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()["data"]


# -------------------- WALLET --------------------

@app.get("/wallet")
def wallet():
    balance = get_wallet_balance()
    return {"wallet_balance": balance}


# -------------------- GET BUNDLES --------------------

@app.get("/bundles")
def bundles():
    bundles = get_all_bundles()

    formatted = []
    for bundle in bundles:
        formatted.append({
            "id": bundle["id"],  # IMPORTANT: use real ID
            "name": bundle["name"],
            "network": bundle["network"],
            "volumeInMB": bundle["volumeInMB"],
            "price": float(bundle["price"])
        })

    return {"bundles": formatted}


# latest
@app.post("/buy-bundle")
def buy_bundle(payload: BuyBundleRequest):
    wallet_balance = get_wallet_balance()
    bundles = get_all_bundles()

    # Find the selected bundle by ID
    selected_bundle = next((b for b in bundles if str(b["id"]) == payload.bundle_id), None)
    if not selected_bundle:
        raise HTTPException(status_code=400, detail="Bundle not found")

    api_price = float(selected_bundle["price"])
    selling_price = api_price + 2
    profit = selling_price - api_price

    if wallet_balance < api_price:
        raise HTTPException(status_code=400, detail="Insufficient wallet balance")

    # Remadata expects volumeInMB and networkType
    buy_payload = {
        "ref": str(uuid.uuid4()),
        "phone": payload.phone_number,
        "volumeInMB": selected_bundle["volumeInMB"],  # add this
        "networkType": selected_bundle["network"]     # add this
    }

    response = requests.post(
        f"{BASE_URL}/buy-data",
        headers=HEADERS,
        json=buy_payload,
        timeout=10
    )

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    transaction = {
        "id": buy_payload["ref"],
        "phone": payload.phone_number,
        "bundle": selected_bundle["name"],
        "network": selected_bundle["network"],
        "api_price": api_price,
        "selling_price": selling_price,
        "profit": profit,
        "date": datetime.now().isoformat(),
        "type": "bundle"
    }

    transactions.append(transaction)

    return {
        "status": "success",
        "message": "Bundle purchased successfully",
        "selling_price": selling_price,
        "profit": profit,
        "wallet_balance_after": wallet_balance - api_price
    }
# -------------------- LOAD BUNDLE (AIRTIME STYLE) --------------------

@app.post("/load-bundle")
def load_bundle(payload: LoadBundleRequest):

    wallet_balance = get_wallet_balance()

    if wallet_balance < payload.amount:
        raise HTTPException(status_code=400, detail="Insufficient wallet balance")

    load_payload = {
        "ref": str(uuid.uuid4()),
        "phone": payload.phone_number,
        "amount": payload.amount,
        "network": payload.network
    }

    response = requests.post(
        f"{BASE_URL}/load-data",
        headers=HEADERS,
        json=load_payload,
        timeout=10
    )

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    profit = payload.amount * 0.02  # example 2% commission

    transaction = {
        "id": load_payload["ref"],
        "phone": payload.phone_number,
        "network": payload.network,
        "amount": payload.amount,
        "profit": profit,
        "date": datetime.now().isoformat(),
        "type": "load"
    }

    transactions.append(transaction)

    return {
        "status": "success",
        "message": "Bundle loaded successfully",
        "profit": profit,
        "wallet_balance_after": wallet_balance - payload.amount
    }


# -------------------- TRANSACTIONS --------------------

@app.get("/transactions")
def get_transactions():
    return transactions


# -------------------- TOTAL PROFIT --------------------

@app.get("/total-profit")
def total_profit():
    total = sum(t["profit"] for t in transactions)
    return {"total_profit": total}


# app/main.py
# import os
# from fastapi import FastAPI
# from app.database import engine, Base, SessionLocal
# from sqlalchemy.exc import SQLAlchemyError

# app = FastAPI(title="MobileApp API")

# # -------------------------------------
# # Startup event to create tables (optional)
# # -------------------------------------
# @app.on_event("startup")
# def startup_event():
#     try:
#         Base.metadata.create_all(bind=engine)
#         print("Tables created successfully")
#     except SQLAlchemyError as e:
#         print(f"Error creating tables: {e}")

# # -------------------------------------
# # Root endpoint
# # -------------------------------------
# @app.get("/")
# def root():
#     return {"status": "ok", "message": "MobileApp API is running"}

# # -------------------------------------
# # Test database connection
# # -------------------------------------
# @app.get("/test-db")
# def test_db():
#     try:
#         conn = engine.connect()
#         conn.close()
#         return {"status": "success", "message": "Database connected"}
#     except Exception as e:
#         return {"status": "error", "message": str(e)}

# # -------------------------------------
# # Example: Wallet endpoint (replace with your logic)
# # -------------------------------------
# @app.get("/wallet")
# def wallet():
#     # Example placeholder
#     return {"balance": 100, "currency": "USD"}

# # -------------------------------------
# # Uvicorn runner for local testing
# # -------------------------------------
# if __name__ == "__main__":
#     import uvicorn
#     port = int(os.environ.get("PORT", 8000))  # Render sets PORT automatically
#     uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)