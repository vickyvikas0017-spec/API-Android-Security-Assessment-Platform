import shutil
import subprocess
import requests
from typing import Dict, Any

def check_docker_status() -> Dict[str, Any]:
    docker_bin = shutil.which("docker")
    if not docker_bin:
        return {
            "installed": False,
            "running": False,
            "version": None,
            "message": "Docker CLI is not detected on the system.",
            "setup_guide": get_crapi_instructions(docker_available=False)
        }
    
    # Check docker version
    try:
        ver_res = subprocess.run([docker_bin, "--version"], capture_output=True, text=True, timeout=5)
        docker_version = ver_res.stdout.strip()
    except Exception:
        docker_version = "Unknown"

    # Check if daemon is running
    try:
        ps_res = subprocess.run([docker_bin, "info"], capture_output=True, text=True, timeout=5)
        daemon_running = ps_res.returncode == 0
    except Exception:
        daemon_running = False

    return {
        "installed": True,
        "running": daemon_running,
        "version": docker_version,
        "message": "Docker daemon is operational." if daemon_running else "Docker is installed but the Docker daemon/desktop is not running.",
        "setup_guide": get_crapi_instructions(docker_available=daemon_running)
    }

def check_crapi_service(base_url: str = "http://localhost:8888") -> Dict[str, Any]:
    try:
        resp = requests.get(f"{base_url}/health", timeout=3)
        return {
            "reachable": True,
            "status_code": resp.status_code,
            "url": base_url,
            "message": f"crAPI is active and reachable at {base_url}"
        }
    except Exception as e:
        return {
            "reachable": False,
            "status_code": None,
            "url": base_url,
            "message": f"crAPI is not reachable at {base_url} ({str(e)})"
        }

def get_crapi_instructions(docker_available: bool) -> str:
    if not docker_available:
        return (
            "### OWASP crAPI Lab Setup Instructions\n\n"
            "Docker is required to run the local containerized crAPI environment.\n\n"
            "**Prerequisites:**\n"
            "1. Install [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)\n"
            "2. Ensure WSL 2 backend is enabled and Docker Desktop is running.\n\n"
            "**Setup Steps:**\n"
            "```bash\n"
            "# 1. Clone the official OWASP crAPI repository\n"
            "git clone https://github.com/OWASP/crAPI.git\n"
            "cd crAPI/deploy/docker\n\n"
            "# 2. Pull prebuilt containers and launch the lab\n"
            "docker compose -f docker-compose.yml --compatibility pull\n"
            "docker compose -f docker-compose.yml --compatibility up -d\n\n"
            "# 3. Verify services are up:\n"
            "# Web UI & API Gateway: http://localhost:8888\n"
            "# Mailhog (Email / OTP inbox): http://localhost:8025\n"
            "```\n"
            "Once running, you can interact with crAPI endpoints directly through this platform."
        )
    return (
        "### OWASP crAPI Quick Start Commands\n\n"
        "```bash\n"
        "# Navigate to crAPI docker directory or run:\n"
        "curl -o docker-compose.yml https://raw.githubusercontent.com/OWASP/crAPI/develop/deploy/docker/docker-compose.yml\n"
        "docker compose up -d\n"
        "```\n"
        "Services:\n"
        "- **crAPI Web & API**: `http://localhost:8888`\n"
        "- **Mailhog (OTP)**: `http://localhost:8025`"
    )

