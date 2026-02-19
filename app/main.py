import requests
import uuid
from datetime import datetime
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from app.core import config  # Make sure config.API_KEY = "your real key"

app = FastAPI(title="VTU Reseller Backend")

# Temporary transaction storage (we will later move to SQLite)
transactions = []


# -------------------- Schema --------------------
class BuyDataRequest(BaseModel):
    phone_number: str
    bundle_id: str


# -------------------- Health --------------------
@app.get("/health")
def health():
    return {"status": "healthy"}


# -------------------- Wallet --------------------
@app.get("/wallet")
def wallet():
    headers = {"X-API-KEY": config.API_KEY}

    try:
        response = requests.get(
            "https://remadata.com/api/wallet-balance",
            headers=headers,
            timeout=10
        )

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)

        data = response.json()
        balance = float(data.get("data", {}).get("balance", 0))

        return {"wallet_balance": balance}

    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------------------- Bundles --------------------
@app.get("/bundles")
def bundles():
    headers = {"X-API-KEY": config.API_KEY}

    try:
        response = requests.get(
            "https://remadata.com/api/bundles",
            headers=headers,
            timeout=10
        )

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)

        data = response.json()

        # Return only important fields for your Kivy app
        formatted = []
        for bundle in data.get("data", []):
            formatted.append({
                "id": bundle["name"],
                "network": bundle["network"],
                "volumeInMB": bundle["volumeInMB"],
                "price": float(bundle["price"])
            })

        return {"bundles": formatted}

    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------------------- Buy Bundle --------------------
@app.post("/buy")
def buy_bundle(payload: BuyDataRequest):

    headers = {"X-API-KEY": config.API_KEY}

    # 1️⃣ Get Wallet Balance
    wallet_resp = requests.get(
        "https://remadata.com/api/wallet-balance",
        headers=headers,
        timeout=10
    )

    wallet_balance = float(wallet_resp.json()["data"]["balance"])

    # 2️⃣ Get Bundles
    bundles_resp = requests.get(
        "https://remadata.com/api/bundles",
        headers=headers,
        timeout=10
    )

    bundles = bundles_resp.json()["data"]

    # 3️⃣ Find Selected Bundle
    selected_bundle = next(
        (b for b in bundles if b["name"] == payload.bundle_id),
        None
    )

    if not selected_bundle:
        raise HTTPException(status_code=400, detail="Bundle not found")

    api_price = float(selected_bundle["price"])

    # 4️⃣ Add Your Markup (example: +2 GHS profit)
    selling_price = api_price + 2
    profit = selling_price - api_price

    if wallet_balance < api_price:
        raise HTTPException(status_code=400, detail="Insufficient wallet balance")

    # 5️⃣ Buy From Remadata
    buy_payload = {
        "ref": str(uuid.uuid4()),
        "phone": payload.phone_number,
        "volumeInMB": selected_bundle["volumeInMB"],
        "networkType": selected_bundle["network"]
    }

    resp = requests.post(
        "https://remadata.com/api/buy-data",
        headers=headers,
        json=buy_payload,
        timeout=10
    )

    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    # 6️⃣ Save Transaction
    transaction = {
        "id": buy_payload["ref"],
        "phone": payload.phone_number,
        "bundle": payload.bundle_id,
        "network": selected_bundle["network"],
        "api_price": api_price,
        "selling_price": selling_price,
        "profit": profit,
        "date": datetime.now().isoformat()
    }

    transactions.append(transaction)

    return {
        "status": "success",
        "message": "Bundle purchased successfully",
        "profit": profit,
        "selling_price": selling_price,
        "wallet_balance_after": wallet_balance - api_price
    }


# -------------------- Transaction History --------------------
@app.get("/transactions")
def get_transactions():
    return transactions


# -------------------- Total Profit --------------------
@app.get("/total-profit")
def total_profit():
    total = sum(t["profit"] for t in transactions)
    return {"total_profit": total}
