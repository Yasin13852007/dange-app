from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# SQLite database connection URL
DATABASE_URL = "sqlite:///./dange.db"

# Create SQLAlchemy engine instance
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

# Create SessionLocal class for database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for declarative models
Base = declarative_base()

def get_db():
    """
    Dependency generator that yields a database session 
    and ensures it closes after request completion.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        