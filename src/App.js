import React, { useState, useEffect } from 'react';
import './App.css';
import useGameStore from './store/gameStore';
// import GameHeader from './components/GameHeader';
// import SurveyGame from './components/SurveyGame';
// import Leaderboard from './components/Leaderboard';
// import AdminPanel from './components/AdminPanel';
import WelcomeScreen from './components/WelcomeScreen';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import Confetti from 'react-confetti';

function App() {
  const { user, gameStats } = useGameStore();
  const [currentView, setCurrentView] = useState('welcome'); 
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // 디버깅
  useEffect(() => {
    console.log('👤 User:', user);
    console.log('📊 GameStats:', gameStats);
  }, [user, gameStats]);

  // 윈도우 크기 추적
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 레벨업 시 축하 효과
  useEffect(() => {
    if (gameStats?.level > 1) {
      setShowConfetti(true);
      toast.success(`🎉 레벨 ${gameStats.level} 달성!`, {
        duration: 4000,
        position: 'top-center',
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontSize: '1.2rem',
          padding: '1rem',
        },
      });
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [gameStats?.level]);

  // 🔍 테스트: 일단 WelcomeScreen만 렌더링
  const renderView = () => {
    return <WelcomeScreen onStart={() => {
      console.log('🚀 Start clicked!');
      setCurrentView('survey');
    }} />;
  };

  return (
    <div className="App">
      {/* 축하 효과 */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.1}
        />
      )}

      {/* 토스트 알림 */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* 메인 화면 */}
      <div className="main-content">
        {renderView()}
      </div>
    </div>
  );
}

export default App;
