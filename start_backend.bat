@echo off
setlocal
cd /d "%~dp0"
title Security Platform Backend (FastAPI)

set "PYTHON_EXE="
if exist "%LOCALAPPDATA%\Programs\Python\Python313\python.exe" (
    set "PYTHON_EXE=%LOCALAPPDATA%\Programs\Python\Python313\python.exe"
) else (
    set "PYTHON_EXE=python"
)

echo Starting FastAPI Backend on http://127.0.0.1:8000 ...
"%PYTHON_EXE%" -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
pause
