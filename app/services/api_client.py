
# # app/services/api_client.py
# import requests
# import os
# from dotenv import load_dotenv

# load_dotenv()

# API_KEY = os.getenv("REMADATA_API_KEY")
# BASE_URL = "https://remadata.com/api"  # Base URL

# def get_wallet_balance():
#     """Fetch wallet balance from Remadata API"""
#     if not API_KEY:
#         return {"error": "API key not set"}
    
#     url = f"{BASE_URL}/wallet-balance"  # Correct endpoint
#     headers = {"X-API-KEY": API_KEY}
    
#     try:
#         response = requests.get(url, headers=headers, timeout=10)
#         response.raise_for_status()  # Raise error if HTTP status >=400
#         return response.json()       # JSON should contain wallet info
#     except requests.RequestException as e:
#         return {"error": str(e)}

# import requests
# import os
# from dotenv import load_dotenv

# # Load .env file
# load_dotenv()

# API_KEY = os.getenv("REMADATA_API_KEY")
# BASE_URL = "https://remadata.com/api"  # Replace with actual Remadata URL

# # Helper function to ensure API key exists
# def check_api_key():
#     if not API_KEY:
#         raise ValueError("REMADATA_API_KEY is not set in environment!")

# # Fetch wallet balance from Remadata API
# def get_wallet_balance():
#     try:
#         check_api_key()
#         url = f"{BASE_URL}/wallet-balance"  # Use correct endpoint
#         headers = {"X-API-KEY": str(API_KEY)}  # ensure string type
#         response = requests.get(url, headers=headers, timeout=10)
#         response.raise_for_status()
#         return response.json()
#     except requests.RequestException as e:
#         return {"error": f"Request failed: {str(e)}"}
#     except ValueError as ve:
#         return {"error": str(ve)}


# # Buy data bundle from Remadata API
# def buy_data_bundle(phone_number: str, bundle_id: str, cost_price: float):
#     try:
#         check_api_key()
#         url = f"{BASE_URL}/buy-data"
#         headers = {"X-API-KEY": str(API_KEY)}
#         payload = {
#             "phone_number": phone_number,
#             "bundle_id": bundle_id,
#             "cost_price": cost_price
#         }
#         response = requests.post(url, headers=headers, json=payload, timeout=15)
#         response.raise_for_status()
#         return {"remadata_response": response.json(),
#                 "selling_price": response.json().get("selling_price", 0),
#                 "profit": response.json().get("profit", 0)}
#     except requests.RequestException as e:
#         return {"error": f"Request failed: {str(e)}"}
#     except ValueError as ve:
#         return {"error": str(ve)}

# WK

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.database.database import SessionLocal, engine, Base
from app.models.transaction import Transaction
from app.core import config
import requests

# -------------------- CREATE TABLES --------------------
Base.metadata.create_all(bind=engine)

# -------------------- FASTAPI APP --------------------
app = FastAPI(title="VTU Reseller Backend")

# -------------------- SCHEMA --------------------
class BuyDataRequest(BaseModel):
    phone_number: str
    bundle_id: str
    cost_price: float

# -------------------- WALLET --------------------
@app.get("/wallet")
def wallet():
    headers = {"X-API-KEY": config.API_KEY}
    try:
        resp = requests.get("https://remadata.com/api/wallet-balance", headers=headers, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        balance = float(data.get("data", {}).get("balance", 0))
        return {"wallet_balance": balance}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -------------------- BUNDLES --------------------
@app.get("/bundles")
def bundles(network: str = None):
    headers = {"X-API-KEY": config.API_KEY}
    try:
        url = "https://remadata.com/api/bundles"
        if network:
            url += f"?network={network}"
        resp = requests.get(url, headers=headers, timeout=10)
        resp.raise_for_status()
        data = resp.json().get("data", [])
        # Format as {name (network): price}
        bundles_dict = {}
        for b in data:
            name = f"{b.get('name','Unknown')} ({b.get('network','')})"
            price = float(b.get("price", 0))
            bundles_dict[name] = price
        return {"data": bundles_dict}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -------------------- BUY DATA --------------------
@app.post("/buy-data")
def buy_data(payload: BuyDataRequest):
    db = SessionLocal()
    headers = {"X-API-KEY": config.API_KEY}

    # 1️⃣ Check wallet balance
    try:
        wallet_resp = requests.get("https://remadata.com/api/wallet-balance", headers=headers, timeout=10)
        wallet_resp.raise_for_status()
        wallet_balance = float(wallet_resp.json()["data"]["balance"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cannot fetch wallet: {e}")

    if wallet_balance < payload.cost_price:
        raise HTTPException(status_code=400, detail="Insufficient funds")

    # 2️⃣ Decide selling price and profit
    selling_price = payload.cost_price + 2  # Example: GHS 2 profit
    profit = selling_price - payload.cost_price

    # 3️⃣ Buy from Remadata
    try:
        buy_resp = requests.post(
            "https://remadata.com/api/buy-data",
            headers=headers,
            json={
                "phone_number": payload.phone_number,
                "bundle_id": payload.bundle_id,
                "cost_price": payload.cost_price
            },
            timeout=10
        )
        if buy_resp.status_code != 200:
            raise HTTPException(status_code=400, detail=f"Purchase failed: {buy_resp.text}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Remadata buy failed: {e}")

    # 4️⃣ Save transaction in DB
    transaction = Transaction(
        phone_number=payload.phone_number,
        bundle_id=payload.bundle_id,
        cost_price=payload.cost_price,
        selling_price=selling_price,
        profit=profit,
        status="success"
    )
    db.add(transaction)
    db.commit()
    db.close()

    return {
        "status": "success",
        "profit": profit,
        "selling_price": selling_price
    }

# -------------------- TRANSACTIONS HISTORY --------------------
@app.get("/transactions")
def get_transactions():
    db = SessionLocal()
    try:
        txs = db.query(Transaction).order_by(Transaction.id.desc()).all()
        return {"transactions": [t.__dict__ for t in txs]}
    finally:
        db.close()
