
# from sqlalchemy import Column, Integer, String, Float, DateTime
# from datetime import datetime
# from app.database import Base

# class Transaction(Base):
#     __tablename__ = "transactions"

#     id = Column(Integer, primary_key=True, index=True)
#     phone = Column(String)
#     network = Column(String)
#     volume = Column(Integer)
#     api_price = Column(Float)
#     selling_price = Column(Float)
#     profit = Column(Float)
#     reference = Column(String)
#     created_at = Column(DateTime, default=datetime.utcnow)

# from sqlalchemy import Column, Integer, String, Float, DateTime
# from datetime import datetime
# from app.database.database import Base

# class Transaction(Base):
#     __tablename__ = "transactions"

#     id = Column(Integer, primary_key=True, index=True)
#     phone_number = Column(String, nullable=False)
#     bundle_id = Column(String, nullable=False)

#     cost_price = Column(Float, nullable=False)      # Remadata price
#     selling_price = Column(Float, nullable=False)   # Your price
#     profit = Column(Float, nullable=False)

#     status = Column(String, default="success")
#     created_at = Column(DateTime, default=datetime.utcnow)

#WK
from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from app.database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String, nullable=False)
    bundle_id = Column(String, nullable=False)
    cost_price = Column(Float, nullable=False)
    selling_price = Column(Float, nullable=False)
    profit = Column(Float, nullable=False)
    status = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
