import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.app.core.config import PROJECT_NAME, PROJECT_VERSION, UPLOADS_DIR, PROJECT_ROOT
from backend.app.core.database import engine, Base, SessionLocal
from backend.app.api.router import api_v1_router
from backend.seed_data import seed_initial_data

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=PROJECT_NAME,
    version=PROJECT_VERSION,
    description="Backend API for API & Android Security Assessment Platform (August Batch Minor Project)"
)

# CORS configuration for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads static directory
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# Include Router
app.include_router(api_v1_router)

# Mount Frontend static files if built
FRONTEND_DIST = PROJECT_ROOT / "frontend" / "dist"
if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()

@app.get("/api/health")
def api_health():
    return {
        "status": "online",
        "platform": PROJECT_NAME,
        "version": PROJECT_VERSION
    }

@app.get("/{full_path:path}")
def serve_frontend_spa(full_path: str):
    if FRONTEND_DIST.exists():
        index_file = FRONTEND_DIST / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
    return {
        "status": "online",
        "platform": PROJECT_NAME,
        "version": PROJECT_VERSION,
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
