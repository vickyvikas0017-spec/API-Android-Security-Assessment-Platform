import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
PROJECT_ROOT = BASE_DIR.parent

DATABASE_DIR = PROJECT_ROOT / "database"
UPLOADS_DIR = PROJECT_ROOT / "uploads"
APK_UPLOADS_DIR = UPLOADS_DIR / "apk"
EVIDENCE_UPLOADS_DIR = UPLOADS_DIR / "evidence"
REPORTS_DIR = PROJECT_ROOT / "reports"

DATABASE_DIR.mkdir(parents=True, exist_ok=True)
APK_UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
EVIDENCE_UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

DATABASE_URL = f"sqlite:///{DATABASE_DIR / 'security_platform.db'}"

PROJECT_NAME = "API & Android Security Assessment Platform"
PROJECT_VERSION = "1.0.0"
DEFAULT_TARGET_URL = "http://localhost:8888" # Default local crAPI port

