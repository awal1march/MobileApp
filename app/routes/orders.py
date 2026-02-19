# from fastapi import APIRouter, Depends
# from sqlalchemy.orm import Session
# from app.database.db import SessionLocal
# from app.models.buy_request import BuyDataRequest
# from app.services.order_service import process_order

# router = APIRouter()

# # Dependency
# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

# @router.post("/buy-data")
# async def buy_data(request: BuyDataRequest, db: Session = Depends(get_db)):
#     transaction, remadata_response = await process_order(
#         db,
#         phone_number=request.phone_number,
#         bundle_id=request.data_package,
#         cost_price=request.amount,
#         user_id=request.user_id
#     )
#     return {
#         "status": "success",
#         "transaction": {
#             "phone_number": transaction.phone_number,
#             "bundle_name": transaction.bundle_name,
#             "cost_price": transaction.cost_price,
#             "selling_price": transaction.selling_price,
#             "profit": transaction.profit,
#             "order_id": transaction.order_id
#         },
#         "remadata": remadata_response
#     }

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.db import SessionLocal
from app.models.buy_request import BuyDataRequest
from app.services.reseller_client import buy_data_bundle

router = APIRouter()

# DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/buy-data")
async def buy_data(request: BuyDataRequest, db: Session = Depends(get_db)):

    result = await buy_data_bundle(
        request.phone_number,
        request.bundle_id,
        request.cost_price
    )

    return {
        "status": "success",
        "transaction": result
    }
