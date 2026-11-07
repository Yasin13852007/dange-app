from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
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

# Configure Cross-Origin Resource Sharing (CORS) to allow frontend communication
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

@app.patch("/subscriptions/{subscription_id}/toggle", response_model=schemas.SubscriptionResponse)
def toggle_subscription(subscription_id: int, db: Session = Depends(get_db)):
    """Toggle the active status (True/False) of a subscription."""
    db_sub = db.query(models.Subscription).filter(models.Subscription.id == subscription_id).first()
    
    if not db_sub:
        raise HTTPException(status_code=404, detail="Subscription not found")

    # Invert the boolean status
    db_sub.is_active = not db_sub.is_active
    
    db.commit()
    db.refresh(db_sub)
    return db_sub

@app.put(
    "/subscriptions/{subscription_id}",
    response_model=schemas.SubscriptionResponse,
    tags=["Subscriptions"]
)
def update_subscription(
    subscription_id: int,
    subscription: schemas.SubscriptionCreate,
    db: Session = Depends(get_db)
):
    """
    Update an existing subscription by ID.
    """
    updated_subscription = crud.update_subscription(
        db=db,
        subscription_id=subscription_id,
        subscription_update=subscription
    )
    if updated_subscription is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found"
        )
    return updated_subscription