import httpx
import os
from app.services.pricing import calculate_selling_price, calculate_profit

API_KEY = os.getenv("REMADATA_API_KEY")
BASE_URL = "https://remadata.com/api"

async def buy_data_bundle(phone_number: str, bundle_id: str, cost_price: float):
    selling_price = calculate_selling_price(cost_price)
    profit = calculate_profit(cost_price)

    async with httpx.AsyncClient() as client:
        headers = {"X-API-KEY": API_KEY}
        payload = {
            "phone_number": phone_number,
            "bundle_id": bundle_id
        }
        # Call Remadata API
        resp = await client.post(f"{BASE_URL}/buy-data", headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()

    return {
        "remadata_response": data,
        "selling_price": selling_price,
        "profit": profit
    }
