# For simplicity, we store wallet balances locally in memory
# In production, this should be in PostgreSQL

# In-memory wallet storage (for testing)
wallets = {
    1: 1000.0  # user_id: balance
}

def get_wallet_balance(user_id: int):
    return wallets.get(user_id, 0)

def update_wallet(user_id: int, amount: float):
    wallets[user_id] = wallets.get(user_id, 0) + amount
    return wallets[user_id]
