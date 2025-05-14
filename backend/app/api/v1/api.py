from fastapi import APIRouter
from app.api.v1.endpoints import users, auth, models, recommendations

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(models.router, prefix="/models", tags=["llm-models"])
api_router.include_router(recommendations.router, prefix="/recommendations", tags=["recommendations"])
