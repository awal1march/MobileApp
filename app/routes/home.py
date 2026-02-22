# from fastapi import APIRouter

# router = APIRouter()

# @router.get("/home")
# def home():
#     return {"message": "Welcome to your dashboard!"}
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
import requests
from app.core import config

app = FastAPI(title="VTU Reseller Backend - RemaData")


class BuyDataRequest(BaseModel):
    phone: str
    plan_id: int


# ───────────── WALLET ─────────────
@app.get("/wallet")
def get_wallet_balance():
    headers = {
        "X-API-KEY": config.API_KEY,
        "Accept": "application/json"
    }

    try:
        resp = requests.get(
            "https://remadata.com/api/wallet-balance",
            headers=headers,
            timeout=10
        )
        resp.raise_for_status()

        data = resp.json()

        return {
            "status": "success",
            "wallet_balance": data.get("balance", 0)
        }

    except requests.Timeout:
        raise HTTPException(status_code=504, detail="Wallet request timed out")
    except requests.HTTPError:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ───────────── BUNDLES ─────────────
@app.get("/bundles")
def get_bundles(network: str = Query(None)):
    headers = {
        "X-API-KEY": config.API_KEY,
        "Accept": "application/json"
    }

    params = {}
    if network:
        params["network"] = network.lower()

    try:
        resp = requests.get(
            "https://remadata.com/api/bundles",
            headers=headers,
            params=params,
            timeout=10
        )
        resp.raise_for_status()

        data = resp.json()

        return {
            "status": "success",
            "data": data
        }

    except requests.Timeout:
        raise HTTPException(status_code=504, detail="Bundles request timed out")
    except requests.HTTPError:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ───────────── BUY DATA ─────────────
@app.post("/buy")
def buy(payload: BuyDataRequest):
    headers = {
        "X-API-KEY": config.API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    body = {
        "phone": payload.phone,
        "plan_id": payload.plan_id
    }

    try:
        resp = requests.post(
            "https://remadata.com/api/buy-data",
            json=body,
            headers=headers,
            timeout=15
        )
        resp.raise_for_status()

        return resp.json()

    except requests.Timeout:
        raise HTTPException(status_code=504, detail="Purchase timed out")
    except requests.HTTPError:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))