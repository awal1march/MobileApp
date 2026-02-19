# from fastapi import APIRouter

# router = APIRouter()

# @router.get("/home")
# def home():
#     return {"message": "Welcome to your dashboard!"}
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
import requests
from app.core import config  # contains API_KEY

app = FastAPI(title="VTU Reseller Backend - RemaData")

# ── Request Schema for Buy Data ──
class BuyDataRequest(BaseModel):
    phone: str                  # e.g. "0244123456"
    plan_id: int                # from /bundles response
    # Optional: you can add network if you want to validate it

# ── Wallet Balance ──
@app.get("/wallet")
def get_wallet_balance():
    headers = {
        "Authorization": f"Bearer {config.API_KEY}",
        "Accept": "application/json"
    }
    url = "https://remadata.com/api/wallet-balance"

    try:
        resp = requests.get(url, headers=headers, timeout=10)
        resp.raise_for_status()
        data = resp.json()

        # Adjust based on actual response structure (this is a guess)
        balance = data.get("data", {}).get("balance", 0)
        return {"status": "success", "wallet_balance": balance}

    except requests.Timeout:
        raise HTTPException(status_code=504, detail="Request to RemaData timed out")
    except requests.HTTPError as http_err:
        raise HTTPException(status_code=resp.status_code, detail=f"API error: {http_err}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch wallet: {str(e)}")


# ── Fetch Available Bundles ──
@app.get("/bundles")
def get_bundles(network: str = Query(None, description="Filter by network e.g. mtn, vodafone, airteltigo")):
    headers = {
        "Authorization": f"Bearer {config.API_KEY}",
        "Accept": "application/json"
    }
    url = "https://remadata.com/api/bundles"

    params = {}
    if network:
        # Normalize network name (RemaData might expect lowercase or specific format)
        params["network"] = network.lower()

    try:
        resp = requests.get(url, headers=headers, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()

        bundles = data.get("data", [])
        return {"status": "success", "data": bundles}

    except requests.Timeout:
        raise HTTPException(status_code=504, detail="Request timed out")
    except requests.HTTPError as http_err:
        raise HTTPException(status_code=resp.status_code or 502, detail=f"API returned error: {http_err}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch bundles: {str(e)}")


# ── Buy Data Bundle ──
@app.post("/buy-data")
def buy_data(payload: BuyDataRequest):
    headers = {
        "Authorization": f"Bearer {config.API_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    url = "https://remadata.com/api/buy-data"

    # Prepare payload in RemaData format
    request_body = {
        "phone": payload.phone,
        "plan_id": payload.plan_id,
        # "network": "MTN-GH"  # ← optional if RemaData infers from plan_id
    }

    try:
        resp = requests.post(url, json=request_body, headers=headers, timeout=15)
        resp.raise_for_status()
        data = resp.json()

        # You can add extra validation / formatting here
        return {
            "status": data.get("success", False) and "success" or "failed",
            "message": data.get("message", "No message provided"),
            "data": data
        }

    except requests.Timeout:
        raise HTTPException(status_code=504, detail="Purchase request timed out")
    except requests.HTTPError as http_err:
        error_detail = resp.json() if resp.content else str(http_err)
        raise HTTPException(status_code=resp.status_code or 502, detail=f"Purchase failed: {error_detail}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Purchase failed: {str(e)}")