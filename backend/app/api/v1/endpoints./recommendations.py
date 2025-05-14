from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, List, Dict

from app.api.deps import get_db, get_current_user
from app.models.models import User, LLMModel, Recommendation, RecommendationItem
from app.schemas.schemas import (
    RecommendationCreate, 
    RecommendationResponse, 
    RequirementQuestion
)

router = APIRouter()

# Sample recommendation questions
RECOMMENDATION_QUESTIONS = [
    RequirementQuestion(
        id="task_type",
        question="What type of task do you need the LLM for?",
        options=[
            {"value": "text_generation", "label": "Text Generation"},
            {"value": "code_generation", "label": "Code Generation"},
            {"value": "translation", "label": "Translation"},
            {"value": "summarization", "label": "Summarization"},
            {"value": "qa", "label": "Question Answering"},
            {"value": "chat", "label": "Conversational AI"},
        ]
    ),
    RequirementQuestion(
        id="size_preference",
        question="What model size preference do you have?",
        options=[
            {"value": "small", "label": "Small (1-5B parameters)"},
            {"value": "medium", "label": "Medium (5-20B parameters)"},
            {"value": "large", "label": "Large (20-100B parameters)"},
            {"value": "xlarge", "label": "Extra Large (100B+ parameters)"},
        ]
    ),
    RequirementQuestion(
        id="license_preference",
        question="What license type do you prefer?",
        options=[
            {"value": "commercial", "label": "Commercial"},
            {"value": "open_source", "label": "Open Source"},
            {"value": "research", "label": "Research Only"},
            {"value": "any", "label": "Any"},
        ]
    ),
    RequirementQuestion(
        id="budget_constraint",
        question="What is your budget constraint?",
        options=[
            {"value": "free", "label": "Free"},
            {"value": "low", "label": "Low cost"},
            {"value": "medium", "label": "Medium cost"},
            {"value": "high", "label": "High cost (enterprise)"},
            {"value": "any", "label": "No constraint"},
        ]
    ),
    RequirementQuestion(
        id="language_support",
        question="Which languages do you need support for?",
        options=[
            {"value": "english", "label": "English only"},
            {"value": "multilingual", "label": "Multiple major languages"},
            {"value": "specific", "label": "Specific languages (please specify)"},
        ]
    ),
    RequirementQuestion(
        id="deployment",
        question="Where will you deploy the model?",
        options=[
            {"value": "cloud", "label": "Cloud API"},
            {"value": "local", "label": "Local deployment"},
            {"value": "hybrid", "label": "Hybrid approach"},
        ]
    ),
]

@router.get("/questions", response_model=List[RequirementQuestion])
def get_recommendation_questions() -> Any:
    """
    Get recommendation questionnaire.
    """
    return RECOMMENDATION_QUESTIONS

@router.post("/", response_model=RecommendationResponse, status_code=status.HTTP_201_CREATED)
def create_recommendation(
    recommendation_in: RecommendationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Create a new recommendation based on user requirements.
    """
    # Create recommendation record
    recommendation = Recommendation(
        user_id=current_user.id,
        requirements=recommendation_in.requirements
    )
    db.add(recommendation)
    db.commit()
    db.refresh(recommendation)
    
    # Get relevant models based on requirements
    models = get_matching_models(recommendation_in.requirements, db)
    
    # Create recommendation items
    for model_score in models:
        model_id = model_score["model_id"]
        score = model_score["score"]
        reasoning = model_score["reasoning"]
        
        item = RecommendationItem(
            recommendation_id=recommendation.id,
            model_id=model_id,
            score=score,
            reasoning=reasoning
        )
        db.add(item)
    
    db.commit()
    db.refresh(recommendation)
    
    return recommendation

@router.get("/", response_model=List[RecommendationResponse])
def read_recommendations(
    skip: int = 0, 
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Read current user's recommendation history.
    """
    recommendations = db.query(Recommendation).filter(
        Recommendation.user_id == current_user.id
    ).order_by(Recommendation.created_at.desc()).offset(skip).limit(limit).all()
    
    return recommendations

@router.get("/{recommendation_id}", response_model=RecommendationResponse)
def read_recommendation(
    recommendation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Get a specific recommendation by id.
    """
    recommendation = db.query(Recommendation).filter(
        Recommendation.id == recommendation_id,
        Recommendation.user_id == current_user.id
    ).first()
    
    if not recommendation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recommendation not found",
        )
    
    return recommendation

@router.delete("/{recommendation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recommendation(
    recommendation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Delete a recommendation.
    """
    recommendation = db.query(Recommendation).filter(
        Recommendation.id == recommendation_id,
        Recommendation.user_id == current_user.id
    ).first()
    
    if not recommendation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recommendation not found",
        )
    
    # Delete all recommendation items
    db.query(RecommendationItem).filter(
        RecommendationItem.recommendation_id == recommendation_id
    ).delete()
    
    # Delete recommendation
    db.delete(recommendation)
    db.commit()
    
    return None

# Helper function to match models to requirements
def get_matching_models(requirements: Dict, db: Session) -> List[Dict]:
    """
    Match LLM models to user requirements and return sorted matches with scores.
    """
    models = db.query(LLMModel).all()
    results = []
    
    for model in models:
        score = 0
        reasoning_points = []
        
        # Task type matching
        if "task_type" in requirements:
            task_type = requirements["task_type"]
            if task_type == "text_generation" and "text generation" in model.strengths.lower():
                score += 20
                reasoning_points.append("Excellent for text generation tasks")
            elif task_type == "code_generation" and "code" in model.strengths.lower():
                score += 20
                reasoning_points.append("Specialized in code generation")
            elif task_type == "translation" and "translation" in model.strengths.lower():
                score += 20
                reasoning_points.append("Strong multilingual translation capabilities")
            elif task_type == "summarization" and "summarization" in model.strengths.lower():
                score += 20
                reasoning_points.append("Effective at text summarization")
            elif task_type == "qa" and ("qa" in model.strengths.lower() or "question answering" in model.strengths.lower()):
                score += 20
                reasoning_points.append("Optimized for question answering")
            elif task_type == "chat" and "conversational" in model.strengths.lower():
                score += 20
                reasoning_points.append("Designed for conversational interactions")
        
        # Size preference matching
        if "size_preference" in requirements:
            size_pref = requirements["size_preference"]
            if size_pref == "small" and model.parameters and model.parameters <= 5:
                score += 15
                reasoning_points.append("Small model size as preferred")
            elif size_pref == "medium" and model.parameters and 5 < model.parameters <= 20:
                score += 15
                reasoning_points.append("Medium model size as preferred")
            elif size_pref == "large" and model.parameters and 20 < model.parameters <= 100:
                score += 15
                reasoning_points.append("Large model size as preferred")
            elif size_pref == "xlarge" and model.parameters and model.parameters > 100:
                score += 15
                reasoning_points.append("Extra large model as preferred")
        
        # License preference matching
        if "license_preference" in requirements:
            license_pref = requirements["license_preference"]
            if license_pref == "any" or license_pref == model.license_type:
                score += 15
                reasoning_points.append(f"License type ({model.license_type}) matches preference")
        
        # Budget constraint matching
        if "budget_constraint" in requirements and model.pricing_info:
            budget = requirements["budget_constraint"]
            if budget == "free" and "free" in model.pricing_info.lower():
                score += 15
                reasoning_points.append("Available for free as required")
            elif budget == "low" and "low" in model.pricing_info.lower():
                score += 15
                reasoning_points.append("Low cost option")
            elif budget == "medium" and "medium" in model.pricing_info.lower():
                score += 15
                reasoning_points.append("Medium cost tier")
            elif budget == "high" and "enterprise" in model.pricing_info.lower():
                score += 15
                reasoning_points.append("Enterprise-grade offering")
            elif budget == "any":
                score += 10
                reasoning_points.append("Matches any budget constraint")
        
        # Language support matching
        if "language_support" in requirements and model.supported_languages:
            lang_support = requirements["language_support"]
            if lang_support == "english" and "english" in [lang.lower() for lang in model.supported_languages]:
                score += 15
                reasoning_points.append("Supports English as required")
            elif lang_support == "multilingual" and len(model.supported_languages) > 5:
                score += 15
                reasoning_points.append("Strong multilingual support")
            elif lang_support == "specific" and "specific_languages" in requirements:
                specific_langs = requirements["specific_languages"]
                supported = all(lang.lower() in [l.lower() for l in model.supported_languages] for lang in specific_langs)
                if supported:
                    score += 15
                    reasoning_points.append("Supports all the specific languages required")
        
        # Deployment preference matching
        if "deployment" in requirements:
            deployment = requirements["deployment"]
            if deployment == "cloud" and "api" in model.hardware_requirements.lower():
                score += 15
                reasoning_points.append("Available as cloud API")
            elif deployment == "local" and "local" in model.hardware_requirements.lower():
                score += 15
                reasoning_points.append("Suitable for local deployment")
            elif deployment == "hybrid":
                score += 10
                reasoning_points.append("Can be used in hybrid deployment")
        
        # Add basic points for all models
        score += 5
        
        # Only include models with a minimum score
        if score >= 30:
            results.append({
                "model_id": model.id,
                "score": score,
                "reasoning": ". ".join(reasoning_points) + "."
            })
    
    # Sort by score (highest first)
    results.sort(key=lambda x: x["score"], reverse=True)
    
    # Return top 5 results
    return results[:5]
