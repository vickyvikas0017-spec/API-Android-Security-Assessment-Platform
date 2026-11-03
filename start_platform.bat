@echo off
setlocal
cd /d "%~dp0"
title API & Android Security Assessment Platform
echo =====================================================================
echo    API & ANDROID SECURITY ASSESSMENT PLATFORM (August Batch)
echo =====================================================================
echo.

set "PYTHON_EXE="
if exist "%LOCALAPPDATA%\Programs\Python\Python313\python.exe" (
    set "PYTHON_EXE=%LOCALAPPDATA%\Programs\Python\Python313\python.exe"
) else (
    set "PYTHON_EXE=python"
)

echo Python Executable: %PYTHON_EXE%
echo.
echo [1/2] Launching Backend API server (http://127.0.0.1:8000)...
start "Security Platform - Backend" "%PYTHON_EXE%" -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload

echo [2/2] Launching Frontend Dev server (http://localhost:5173)...
start "Security Platform - Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo =====================================================================
echo Both servers have been launched in separate windows!
echo - Frontend Dashboard: http://localhost:5173
echo - Backend API & Docs: http://localhost:8000/docs
echo =====================================================================
echo.
timeout /t 5
