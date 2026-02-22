# For simplicity, we store wallet balances locally in memory
# In production, this should be in PostgreSQL

# In-memory wallet storage (for testing)

# Latest
# wallets = {
#     1: 1000.0  # user_id: balance
# }

# def get_wallet_balance(user_id: int):
#     return wallets.get(user_id, 0)

# def update_wallet(user_id: int, amount: float):
#     wallets[user_id] = wallets.get(user_id, 0) + amount
#     return wallets[user_id]



# from sqlalchemy.orm import Session
# from app import models

# def get_users(db: Session):
#     return db.query(models.User).all()

# def create_user(db: Session, name: str, email: str):
#     user = models.User(name=name, email=email)
#     db.add(user)
#     db.commit()
#     db.refresh(user)
#     return user