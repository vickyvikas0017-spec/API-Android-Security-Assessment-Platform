from fastapi import APIRouter
from backend.app.api.endpoints import router as api_router

api_v1_router = APIRouter()
api_v1_router.include_router(api_router, prefix="/api")

