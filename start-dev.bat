@echo off
title IT-Tools Development Server
echo ===================================================
echo           Starting IT-Tools Dev Server
echo ===================================================
echo.

cd /d "%~dp0"

echo Running dev server (Vite)...
echo.

call pnpm dev 2>nul || call npm run dev

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to start server. Please make sure Node.js and pnpm/npm are installed.
    pause
)
