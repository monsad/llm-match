import sys
import os

# Add the parent directory to the path so we can import the app module
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.models import Base, LLMModel, User, Recommendation, RecommendationItem
from app.api.v1.endpoints.recommendations import get_matching_models
from app.core.security import get_password_hash

# Create test database engine and session
TEST_SQLALCHEMY_DATABASE_URL = sqlite:///./test.db
engine = create_engine(TEST_SQLALCHEMY_DATABASE_URL, connect_args={check_same_thread: False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db_session():
    Create
