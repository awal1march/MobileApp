from app.models.wallet import Wallet
from app.database import SessionLocal

def get_wallet_balance(user_id: int):
    db = SessionLocal()
    wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()
    db.close()
    if wallet:
        return {"status": "success", "balance": wallet.balance}
    return {"status": "error", "message": "User wallet not found"}
