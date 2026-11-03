import time
import json
import requests
from typing import Dict, Any, Optional

def sanitize_headers(headers: Dict[str, str]) -> Dict[str, str]:
    sanitized = {}
    sensitive_keys = {"authorization", "cookie", "set-cookie", "x-api-key", "token", "session"}
    for k, v in headers.items():
        if k.lower() in sensitive_keys:
            if len(v) > 12:
                sanitized[k] = v[:4] + "..." + "*" * 6 + "..." + v[-4:]
            else:
                sanitized[k] = "[REDACTED_SECRET]"
        else:
            sanitized[k] = v
    return sanitized

def redact_sensitive_strings(text: str) -> str:
    if not text:
        return ""
    import re
    # Redact common token patterns: JWT, bearer, api keys
    text = re.sub(r'eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]+', 'eyJ...[REDACTED_JWT]...', text)
    text = re.sub(r'(?i)(api[_-]?key|secret|token|password)[\"\'\s:=]+([\"\'\w\-\.]{12,})', r'\1: "[REDACTED]"', text)
    return text

def execute_http_request(
    url: str,
    method: str = "GET",
    headers: Optional[Dict[str, str]] = None,
    auth_token: Optional[str] = None,
    body: Optional[str] = None,
    params: Optional[Dict[str, str]] = None,
    timeout: int = 10
) -> Dict[str, Any]:
    req_headers = dict(headers or {})
    if auth_token:
        if not auth_token.lower().startswith("bearer "):
            req_headers["Authorization"] = f"Bearer {auth_token}"
        else:
            req_headers["Authorization"] = auth_token

    method = method.upper()
    start_time = time.time()
    
    try:
        data = None
        json_data = None
        if body:
            try:
                json_data = json.loads(body)
            except Exception:
                data = body

        response = requests.request(
            method=method,
            url=url,
            headers=req_headers,
            params=params,
            json=json_data if json_data is not None else None,
            data=data if data is not None else None,
            timeout=timeout,
            verify=False # For local lab certificates if any
        )
        duration_ms = round((time.time() - start_time) * 1000, 2)

        resp_body = response.text
        is_json = False
        try:
            parsed = response.json()
            resp_body = json.dumps(parsed, indent=2)
            is_json = True
        except Exception:
            pass

        return {
            "status_code": response.status_code,
            "duration_ms": duration_ms,
            "headers": dict(response.headers),
            "sanitized_headers": sanitize_headers(dict(response.headers)),
            "body": resp_body,
            "is_json": is_json,
            "error": None
        }
    except requests.exceptions.RequestException as e:
        duration_ms = round((time.time() - start_time) * 1000, 2)
        return {
            "status_code": 0,
            "duration_ms": duration_ms,
            "headers": {},
            "sanitized_headers": {},
            "body": f"Connection error: {str(e)}",
            "is_json": False,
            "error": str(e)
        }

