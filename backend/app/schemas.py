from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class SubscriptionBase(BaseModel):
    """
    Base Pydantic model with shared attributes for subscriptions.
    """
    title: str
    price: float
    billing_cycle: str
    next_payment_date: datetime
    category: Optional[str] = "General"
    is_active: Optional[bool] = True

class SubscriptionCreate(SubscriptionBase):
    """
    Schema used for creating a new subscription.
    """
    pass

class SubscriptionResponse(SubscriptionBase):
    """
    Schema used when returning subscription data to the client, including ID and timestamp.
    """
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
