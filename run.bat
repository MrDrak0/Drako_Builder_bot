@echo off
cd /d "%~dp0"
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)
if not exist .env (
    echo WARNING: .env not found. Copy .env.example to .env and add your bot token.
)
call npm run build
if errorlevel 1 (
    echo Build failed.
    pause
    exit /b 1
)
call npm start
pause