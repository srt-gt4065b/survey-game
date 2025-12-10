@echo off
echo ================================
echo     Gamified Survey Deploy
echo ================================
echo.

echo 🔍 Installing dependencies...
npm install

echo.
echo 🔨 Building React app...
npm run build

echo.
echo 🌐 Deploying to GitHub Pages...
npm run deploy

echo.
echo ✅ Deployment complete!
echo 웹사이트가 성공적으로 업데이트되었습니다.
pause
