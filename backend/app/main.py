from fastapi import FastAPI
from app.database import engine, Base
import app.models as models

# Initialize database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI application instance
app = FastAPI(
    title="Dange API",
    description="Backend API for Dange subscription and recurring expense manager",
    version="0.1.0"
)

@app.get("/")
def read_root():
    """
    Root endpoint to verify API status.
    """
    return {"message": "Welcome to Dange API!", "status": "active"}
