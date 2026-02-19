from sqlalchemy.orm import Session
from app.models.transaction import Transaction
from app.services.reseller_client import buy_data_bundle

async def process_order(db: Session, phone_number: str, bundle_id: str, cost_price: float, user_id: int):
    result = await buy_data_bundle(phone_number, bundle_id, cost_price)

    transaction = Transaction(
        user_id=user_id,
        phone_number=phone_number,
        bundle_name=bundle_id,
        cost_price=cost_price,
        selling_price=result["selling_price"],
        profit=result["profit"],
        order_id=result["remadata_response"].get("order_id", "N/A")
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return transaction, result["remadata_response"]
