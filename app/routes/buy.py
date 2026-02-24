from app.database import SessionLocal
from app.models.transaction import Transaction
import requests
from app import config
from app.models.buy_request import BuyDataRequest
from fastapi import FastAPI, HTTPException

app = FastAPI(title="VTU Reseller Backend")

@app.post("/buy-data")
def buy_data(payload: BuyDataRequest):
    db = SessionLocal()

    headers = {"X-API-KEY": config.API_KEY}

    # Check wallet
    wallet_resp = requests.get(
        "https://remadata.com/api/wallet-balance",
        headers=headers
    )
    wallet_balance = float(wallet_resp.json()["data"]["balance"])

    if wallet_balance < payload.cost_price:
        raise HTTPException(status_code=400, detail="Insufficient funds")

    # 🔹 SELLING PRICE (YOU DECIDE YOUR PROFIT)
    selling_price = payload.cost_price + 2  # Example: GHS 2 profit
    profit = selling_price - payload.cost_price

    # Buy from Remadata
    buy_resp = requests.post(
        "https://remadata.com/api/buy-data",
        headers=headers,
        json={
            "phone_number": payload.phone_number,
            "bundle_id": payload.bundle_id,
            "cost_price": payload.cost_price
        }
    )

    if buy_resp.status_code != 200:
        raise HTTPException(status_code=400, detail="Purchase failed")

    # 🔹 SAVE TRANSACTION
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
