@echo off
setlocal
cd /d "%~dp0frontend"
title Security Platform Frontend (React + Vite)
echo Starting React Vite Dev Server on http://localhost:5173 ...
npm run dev
pause
