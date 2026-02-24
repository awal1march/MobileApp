# main.py
import requests
import uuid
import os
from datetime import datetime
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# -------------------- LOAD ENV --------------------
load_dotenv()
API_KEY = os.getenv("REMADATA_API_KEY")
if not API_KEY:
    print("⚠ WARNING: REMADATA_API_KEY is not set!")

BASE_URL = "https://remadata.com/api"

def get_headers():
    return {
        "X-API-KEY": str(API_KEY),
        "Content-Type": "application/json"
    }

# -------------------- APP --------------------
app = FastAPI(title="VTU Reseller Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- TEMP STORAGE --------------------
transactions = []

# -------------------- SCHEMAS --------------------
class BuyBundleRequest(BaseModel):
    phone_number: str
    bundle_id: str

class LoadBundleRequest(BaseModel):
    phone_number: str
    amount: float
    network: str

# -------------------- ROOT & HEALTH --------------------
@app.get("/")
def root():
    return {"message": "VTU Backend Running 🚀"}

@app.get("/health")
def health():
    return {"status": "healthy"}

# -------------------- HELPERS --------------------
def get_wallet_balance_from_api():
    """Fetch wallet balance from Remadata API"""
    try:
        response = requests.get(f"{BASE_URL}/wallet-balance", headers=get_headers(), timeout=15)
        response.raise_for_status()
        data = response.json()
        if "data" in data and "balance" in data["data"]:
            return float(data["data"]["balance"])
        raise HTTPException(status_code=500, detail="Invalid wallet response format")
    except requests.RequestException as e:
        raise HTTPException(status_code=400, detail=str(e))

def get_all_bundles_from_api():
    """Fetch bundles from Remadata API"""
    try:
        response = requests.get(f"{BASE_URL}/bundles", headers=get_headers(), timeout=15)
        response.raise_for_status()
        data = response.json()
        if "data" in data:
            return data["data"]
        raise HTTPException(status_code=500, detail="Unexpected bundle format")
    except requests.RequestException as e:
        raise HTTPException(status_code=400, detail=str(e))

# -------------------- WALLET --------------------
@app.get("/wallet")
def wallet():
    balance = get_wallet_balance_from_api()
    return {"wallet_balance": balance}

# -------------------- BUNDLES --------------------
@app.get("/bundles")
def bundles():
    bundles = get_all_bundles_from_api()
    formatted = []
    for b in bundles:
        formatted.append({
            "id": str(b.get("id")),
            "name": b.get("name", ""),
            "network": b.get("network", ""),
            "volumeInMB": b.get("volumeInMB", 0),
            "price": float(b.get("price", 0))
        })
    return {"bundles": formatted}

# -------------------- BUY BUNDLE --------------------

@app.post("/buy-bundle")
def buy_bundle(payload: BuyBundleRequest):

    wallet_balance = get_wallet_balance_from_api()
    bundles = get_all_bundles_from_api()

    selected_bundle = next(
        (b for b in bundles if str(b.get("id")) == payload.bundle_id),
        None
    )

    if not selected_bundle:
        raise HTTPException(status_code=400, detail="Bundle not found")

    api_price = float(selected_bundle.get("price", 0))

    if wallet_balance < api_price:
        raise HTTPException(status_code=400, detail="Insufficient wallet balance")

    # ✅ EXACT FORMAT REQUIRED BY REMADATA
    buy_payload = {
        "ref": str(uuid.uuid4()),
        "phone": payload.phone_number,
        "volumeInMB": selected_bundle.get("volumeInMB"),
        "networkType": selected_bundle.get("network")
    }

    try:
        response = requests.post(
            f"{BASE_URL}/buy-data",
            headers=get_headers(),
            json=buy_payload,
            timeout=20
        )

        response.raise_for_status()
        api_response = response.json()

    except requests.RequestException as error:
        raise HTTPException(status_code=400, detail=str(error))

    # Profit = GHS 2 fixed markup
    profit = 2

    transactions.append({
        "id": buy_payload["ref"],
        "phone": payload.phone_number,
        "bundle": selected_bundle.get("name"),
        "network": selected_bundle.get("network"),
        "profit": profit,
        "date": datetime.now().isoformat()
    })

    return {
        "status": "success",
        "message": "Bundle purchased successfully",
        "profit": profit,
        "remadata_response": api_response
    }
# -------------------- LOAD BUNDLE --------------------
@app.post("/buy-data")
def load_bundle(payload: LoadBundleRequest):
    wallet_balance = get_wallet_balance_from_api()
    if wallet_balance < payload.amount:
        raise HTTPException(status_code=400, detail="Insufficient wallet balance")

    load_payload = {
        "ref": str(uuid.uuid4()),
        "phone": payload.phone_number,
        "amount": payload.amount,
        "network": payload.network
    }

    try:
        response = requests.post(f"{BASE_URL}/load-data", headers=get_headers(), json=load_payload, timeout=20)
        response.raise_for_status()
    except requests.RequestException as e:
        raise HTTPException(status_code=400, detail=str(e))

    profit = payload.amount * 0.02
    transactions.append({
        "id": load_payload["ref"],
        "phone": payload.phone_number,
        "profit": profit,
        "date": datetime.now().isoformat()
    })

    return {"status": "success", "profit": profit}

# -------------------- TOTAL PROFIT --------------------
@app.get("/total-profit")
def total_profit():
    total = sum(t["profit"] for t in transactions)
    return {"total_profit": total}