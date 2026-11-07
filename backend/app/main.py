from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import engine, Base, get_db
from app import models, schemas, crud

# Initialize database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI application instance
app = FastAPI(
    title="Dange API",
    description="Backend API for Dange subscription and recurring expense manager",
    version="0.1.0"
)

@app.get("/", tags=["Health"])
def read_root():
    """
    Root endpoint to verify API operational status.
    """
    return {"message": "Welcome to Dange API!", "status": "active"}

@app.post(
    "/subscriptions/",
    response_model=schemas.SubscriptionResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Subscriptions"]
)
def create_subscription(
    subscription: schemas.SubscriptionCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new subscription record.
    """
    return crud.create_subscription(db=db, subscription=subscription)

@app.get(
    "/subscriptions/",
    response_model=List[schemas.SubscriptionResponse],
    tags=["Subscriptions"]
)
def read_subscriptions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Retrieve all subscriptions with optional pagination.
    """
    return crud.get_subscriptions(db=db, skip=skip, limit=limit)

@app.get(
    "/subscriptions/{subscription_id}",
    response_model=schemas.SubscriptionResponse,
    tags=["Subscriptions"]
)
def read_subscription(
    subscription_id: int,
    db: Session = Depends(get_db)
):
    """
    Retrieve a single subscription by ID.
    """
    db_subscription = crud.get_subscription_by_id(db=db, subscription_id=subscription_id)
    if db_subscription is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found"
        )
    return db_subscription

@app.delete(
    "/subscriptions/{subscription_id}",
    response_model=schemas.SubscriptionResponse,
    tags=["Subscriptions"]
)
def delete_subscription(
    subscription_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a subscription by its ID.
    """
    deleted_subscription = crud.delete_subscription(db=db, subscription_id=subscription_id)
    if deleted_subscription is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found"
        )
    return deleted_subscription
