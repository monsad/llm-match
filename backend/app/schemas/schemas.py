from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str
    
    @validator('password')
    def password_min_length(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserInDB(UserBase):
    id: int
    is_active: bool = True
    is_admin: bool = False
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    
    class Config:
        from_attributes = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[int] = None
    exp: Optional[datetime] = None

# LLM Model schemas
class LLMModelBase(BaseModel):
    name: str
    provider: str
    version: Optional[str] = None
    parameters: Optional[float] = None  # Billions of parameters
    description: Optional[str] = None
    training_data: Optional[str] = None
    performance_benchmarks: Optional[Dict[str, Any]] = None
    hardware_requirements: Optional[str] = None
    pricing_info: Optional[str] = None
    strengths: Optional[str] = None
    weaknesses: Optional[str] = None
    supported_languages: Optional[List[str]] = None
    license_type: Optional[str] = None

class LLMModelCreate(LLMModelBase):
    pass

class LLMModelUpdate(LLMModelBase):
    pass

class LLMModelInDB(LLMModelBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class LLMModelResponse(LLMModelInDB):
    class Config:
        from_attributes = True

# Saved model schemas
class SavedModelCreate(BaseModel):
    model_id: int
    notes: Optional[str] = None

class SavedModelResponse(BaseModel):
    id: int
    model: LLMModelResponse
    notes: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Recommendation schemas
class RequirementQuestion(BaseModel):
    id: str
    question: str
    options: List[Dict[str, Any]]

class RecommendationCreate(BaseModel):
    requirements: Dict[str, Any]

class RecommendationItemResponse(BaseModel):
    id: int
    model: LLMModelResponse
    score: float
    reasoning: str
    
    class Config:
        from_attributes = True

class RecommendationResponse(BaseModel):
    id: int
    requirements: Dict[str, Any]
    created_at: datetime
    items: List[RecommendationItemResponse]
    
    class Config:
        from_attributes = True
