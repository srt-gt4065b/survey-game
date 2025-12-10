@echo off
echo ====================================
echo 🎮 김교수님의 게임화 설문 시스템 설치 시작! 🎮
echo ====================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js가 설치되어 있지 않습니다.
    echo 👉 https://nodejs.org 에서 설치해주세요!
    pause
    exit /b 1
)

echo ✅ Node.js 버전:
node -v
echo ✅ NPM 버전:
npm -v
echo.

echo 📦 패키지 설치 중...
call npm install

echo.
echo ====================================
echo ✨ 설치 완료! ✨
echo.
echo 🔥 Firebase 설정:
echo 1. src/firebase/config.js 파일을 열어주세요
echo 2. Firebase 프로젝트 설정값을 입력해주세요
echo.
echo 🚀 실행 방법:
echo npm start
echo.
echo 📱 접속 주소:
echo http://localhost:3000
echo.
echo ====================================
echo 💡 도움이 필요하시면 README.md를 확인해주세요!
echo.
pause
