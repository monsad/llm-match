from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, Float, Table, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

# User model
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    saved_models = relationship("SavedModel", back_populates="user")
    recommendations = relationship("Recommendation", back_populates="user")

# LLM Model
class LLMModel(Base):
    __tablename__ = "llm_models"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    provider = Column(String, nullable=False, index=True)
    version = Column(String)
    parameters = Column(Float)  # Billions of parameters
    description = Column(Text)
    training_data = Column(Text)
    performance_benchmarks = Column(JSON)  # Store benchmark data as JSON
    hardware_requirements = Column(Text)
    pricing_info = Column(Text)
    strengths = Column(Text)
    weaknesses = Column(Text)
    supported_languages = Column(JSON)  # Store as JSON array
    license_type = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    saved_by = relationship("SavedModel", back_populates="model")
    recommendations = relationship("RecommendationItem", back_populates="model")

# User's saved models
class SavedModel(Base):
    __tablename__ = "saved_models"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    model_id = Column(Integer, ForeignKey("llm_models.id"))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="saved_models")
    model = relationship("LLMModel", back_populates="saved_by")

# Recommendation session
class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    requirements = Column(JSON)  # Store requirements as JSON
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="recommendations")
    items = relationship("RecommendationItem", back_populates="recommendation")

# Recommendation items (models recommended in a session)
class RecommendationItem(Base):
    __tablename__ = "recommendation_items"

    id = Column(Integer, primary_key=True, index=True)
    recommendation_id = Column(Integer, ForeignKey("recommendations.id"))
    model_id = Column(Integer, ForeignKey("llm_models.id"))
    score = Column(Float)  # Recommendation score/match percentage
    reasoning = Column(Text)  # Why this model was recommended
    
    # Relationships
    recommendation = relationship("Recommendation", back_populates="items")
    model = relationship("LLMModel", back_populates="recommendations")
