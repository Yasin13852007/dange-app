from sqlalchemy.orm import Session
from app import models, schemas
from typing import List, Optional

def get_subscriptions(db: Session, skip: int = 0, limit: int = 100) -> List[models.Subscription]:
    """
    Retrieve a paginated list of all subscriptions.
    """
    return db.query(models.Subscription).offset(skip).limit(limit).all()

def get_subscription_by_id(db: Session, subscription_id: int) -> Optional[models.Subscription]:
    """
    Retrieve a specific subscription by its unique identifier.
    """
    return db.query(models.Subscription).filter(models.Subscription.id == subscription_id).first()

def create_subscription(db: Session, subscription: schemas.SubscriptionCreate) -> models.Subscription:
    """
    Create and persist a new subscription entry in the database.
    """
    db_subscription = models.Subscription(**subscription.model_dump())
    db.add(db_subscription)
    db.commit()
    db.refresh(db_subscription)
    return db_subscription

def delete_subscription(db: Session, subscription_id: int) -> Optional[models.Subscription]:
    """
    Delete a subscription entry by its ID.
    """
    db_subscription = get_subscription_by_id(db, subscription_id)
    if db_subscription:
        db.delete(db_subscription)
        db.commit()
    return db_subscription
