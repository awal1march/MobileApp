from fastapi import APIRouter, Query
from app.services.wallet_service import get_wallet_balance

router = APIRouter()

@router.get("/wallet")
def wallet(user_id: int = Query(..., description="ID of the user")):
    return get_wallet_balance(user_id)
# ----------------- Update Price -----------------
def update_price(self, spinner, text):
    bundle = self.bundles_dict.get(text)

    if bundle:
        price = bundle.get("price", "-")
        self.price_label.text = f"Price: GHS {price}"
    else:
        self.price_label.text = "Price: -"