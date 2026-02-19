import uuid
import requests
from fastapi import FastAPI, HTTPException

app = FastAPI()

BASE_URL = "https://sandbox.momodeveloper.mtn.com"
SUBSCRIPTION_KEY = "9fa7d02d91584b78853e2f028275365e"

@app.post("/create-api-user")
def create_api_user():
    reference_id = str(uuid.uuid4())

    headers = {
        "X-Reference-Id": reference_id,
        "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
        "Content-Type": "application/json"
    }

    body = {
        "providerCallbackHost": "adaline-scutiform-kathyrn.ngrok-free.dev"
    }


    response = requests.post(
        f"{BASE_URL}/v1_0/apiuser",
        headers=headers,
        json=body
    )

    if response.status_code == 201:
        return {
            "message": "API User created successfully",
            "reference_id": reference_id
        }
    else:
        raise HTTPException(
            status_code=response.status_code,
            detail=response.text
        )