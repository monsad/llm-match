from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, List, Optional

from app.api.deps import get_db, get_current_user, get_current_admin_user
from app.models.models import LLMModel, SavedModel, User
from app.schemas.schemas import (
    LLMModelCreate,
    LLMModelResponse,
    LLMModelUpdate,
    SavedModelCreate,
    SavedModelResponse,
)

router = APIRouter()

@router.get("/", response_model=List[LLMModelResponse])
def read_models(
    skip: int = 0,
    limit: int = 100,
    provider: Optional[str] = None,
    min_parameters: Optional[float] = None,
    max_parameters: Optional[float] = None,
    license_type: Optional[str] = None,
    db: Session = Depends(get_db),
) -> Any:
    """
    Retrieve LLM models with optional filtering.
    """
    query = db.query(LLMModel)
    
    # Apply filters
    if provider:
        query = query.filter(LLMModel.provider == provider)
    if min_parameters:
        query = query.filter(LLMModel.parameters >= min_parameters)
    if max_parameters:
        query = query.filter(LLMModel.parameters <= max_parameters)
    if license_type:
        query = query.filter(LLMModel.license_type == license_type)
    
    # Apply pagination
    models = query.offset(skip).limit(limit).all()
    return models

@router.get("/{model_id}", response_model=LLMModelResponse)
def read_model(model_id: int, db: Session = Depends(get_db)) -> Any:
    """
    Get a specific LLM model by id.
    """
    model = db.query(LLMModel).filter(LLMModel.id == model_id).first()
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model not found",
        )
    return model

@router.post("/", response_model=LLMModelResponse, status_code=status.HTTP_201_CREATED)
def create_model(
    model_in: LLMModelCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Create a new LLM model. Admin only.
    """
    # Check if model with same name and version already exists
    existing_model = db.query(LLMModel).filter(
        LLMModel.name == model_in.name,
        LLMModel.provider == model_in.provider,
        LLMModel.version == model_in.version
    ).first()
    
    if existing_model:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Model {model_in.name} {model_in.version} by {model_in.provider} already exists",
        )
    
    # Create new model
    model = LLMModel(**model_in.model_dump())
    db.add(model)
    db.commit()
    db.refresh(model)
    
    return model

@router.put("/{model_id}", response_model=LLMModelResponse)
def update_model(
    model_id: int,
    model_in: LLMModelUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Update an LLM model. Admin only.
    """
    model = db.query(LLMModel).filter(LLMModel.id == model_id).first()
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model not found",
        )
    
    # Update model attributes
    for key, value in model_in.model_dump(exclude_unset=True).items():
        setattr(model, key, value)
    
    db.add(model)
    db.commit()
    db.refresh(model)
    
    return model

@router.delete("/{model_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_model(
    model_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Delete an LLM model. Admin only.
    """
    model = db.query(LLMModel).filter(LLMModel.id == model_id).first()
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model not found",
        )
    
    db.delete(model)
    db.commit()
    
    return None

@router.post("/save", response_model=SavedModelResponse, status_code=status.HTTP_201_CREATED)
def save_model(
    saved_model_in: SavedModelCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Save an LLM model to user's collection.
    """
    # Check if model exists
    model = db.query(LLMModel).filter(LLMModel.id == saved_model_in.model_id).first()
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model not found",
        )
    
    # Check if model already saved by user
    existing_saved = db.query(SavedModel).filter(
        SavedModel.user_id == current_user.id,
        SavedModel.model_id == saved_model_in.model_id
    ).first()
    
    if existing_saved:
        # Update notes if model already saved
        existing_saved.notes = saved_model_in.notes
        db.add(existing_saved)
        db.commit()
        db.refresh(existing_saved)
        return existing_saved
    
    # Create new saved model
    saved_model = SavedModel(
        user_id=current_user.id,
        model_id=saved_model_in.model_id,
        notes=saved_model_in.notes
    )
    db.add(saved_model)
    db.commit()
    db.refresh(saved_model)
    
    return saved_model

@router.delete("/save/{model_id}", status_code=status.HTTP_204_NO_CONTENT)
def unsave_model(
    model_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Remove an LLM model from user's saved collection.
    """
    saved_model = db.query(SavedModel).filter(
        SavedModel.user_id == current_user.id,
        SavedModel.model_id == model_id
    ).first()
    
    if not saved_model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model not found in your saved collection",
        )
    
    db.delete(saved_model)
    db.commit()
    
    return None
