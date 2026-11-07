from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from datetime import datetime
from app.database import Base

class Subscription(Base):
    """
    Database model for managing recurring subscriptions and expenses.
    """
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    billing_cycle = Column(String, nullable=False)  # e.g., monthly, yearly
    next_payment_date = Column(DateTime, nullable=False)
    category = Column(String, default="General")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    