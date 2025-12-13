@echo off
echo ========================================
echo        Survey Game Auto Deploy
echo ========================================

REM 프로젝트 루트 디렉토리로 이동
cd /d %~dp0

echo.
echo 🔄 Installing dependencies...
npm install

echo.
echo ⚙️  Building project for production...
npm run build

IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed! Deploy aborted.
    pause
    exit /b
)

echo.
echo 🚀 Deploying to GitHub Pages...
npm run deploy

IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Deploy failed!
    pause
    exit /b
)

echo.
echo ========================================
echo    🎉 Deployment Completed Successfully!
echo ========================================
pause
