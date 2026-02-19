
from pydantic import BaseModel

class BuyDataRequest(BaseModel):
    phone_number: str
    bundle_id: str
    cost_price: float
