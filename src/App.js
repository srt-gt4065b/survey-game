import React, { useState, useEffect } from 'react';
import './App.css';
import useGameStore from './store/gameStore';
import GameHeader from './components/GameHeader';
import SurveyGame from './components/SurveyGame';
import Leaderboard from './components/Leaderboard';
import AdminPanel from './components/AdminPanel';
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

  // 🔍 디버깅: user와 gameStats 확인
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

  // 화면 라우팅
  const renderView = () => {
    try {
      switch (currentView) {
        case 'welcome':
          return <WelcomeScreen onStart={() => setCurrentView('survey')} />;

        case 'survey':
          return <SurveyGame onComplete={() => setCurrentView('leaderboard')} />;

        case 'leaderboard':
          return <Leaderboard onBack={() => setCurrentView('survey')} />;

        case 'admin':
          return <AdminPanel onBack={() => setCurrentView('survey')} />;

        default:
          return <WelcomeScreen onStart={() => setCurrentView('survey')} />;
      }
    } catch (error) {
      console.error('🔴 렌더링 에러:', error);
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>에러가 발생했습니다</h2>
          <p>{error.message}</p>
          <button onClick={() => setCurrentView('welcome')}>
            처음으로 돌아가기
          </button>
        </div>
      );
    }
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

      {/* 헤더 */}
      {user?.id && currentView !== 'welcome' && (
        <GameHeader 
          onViewChange={setCurrentView}
          currentView={currentView}
        />
      )}

      {/* 메인 화면 */}
      <div className="main-content">
        {renderView()}
      </div>

      {/* 하단 네비게이션 */}
      {user?.id && currentView !== 'welcome' && (
        <div className="bottom-nav">
          <button 
            className={currentView === 'survey' ? 'active' : ''}
            onClick={() => setCurrentView('survey')}
          >
            📝 설문
          </button>

          <button 
            className={currentView === 'leaderboard' ? 'active' : ''}
            onClick={() => setCurrentView('leaderboard')}
          >
            🏆 순위
          </button>

          {/* admin 계정만 관리 버튼 표시 */}
          {user?.id === 'admin' && (
            <button 
              className={currentView === 'admin' ? 'active' : ''}
              onClick={() => setCurrentView('admin')}
            >
              ⚙️ 관리
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
