import React, { useState, useEffect } from 'react';
import './App.css';
import useGameStore from './store/gameStore';
import GameHeader from './components/GameHeader';
import WelcomeScreen from './components/WelcomeScreen';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import Confetti from 'react-confetti';

// 안전한 컴포넌트 import
let SurveyGame = null;
let Leaderboard = null;
let AdminPanel = null;

try {
  SurveyGame = require('./components/SurveyGame').default;
} catch (error) {
  console.error('❌ SurveyGame 로드 실패:', error);
}

try {
  Leaderboard = require('./components/Leaderboard').default;
} catch (error) {
  console.error('❌ Leaderboard 로드 실패:', error);
}

try {
  AdminPanel = require('./components/AdminPanel').default;
} catch (error) {
  console.error('❌ AdminPanel 로드 실패:', error);
}

function App() {
  const { user, gameStats } = useGameStore();
  const [currentView, setCurrentView] = useState('welcome'); 
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

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
          if (!SurveyGame) {
            return (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>❌ SurveyGame 컴포넌트를 불러올 수 없습니다</h2>
                <p>파일이 없거나 에러가 있습니다.</p>
                <button onClick={() => setCurrentView('welcome')}>
                  처음으로 돌아가기
                </button>
              </div>
            );
          }
          return <SurveyGame onComplete={() => setCurrentView('leaderboard')} />;

        case 'leaderboard':
          if (!Leaderboard) {
            return (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>❌ Leaderboard 컴포넌트를 불러올 수 없습니다</h2>
                <p>파일이 없거나 에러가 있습니다.</p>
                <button onClick={() => setCurrentView('survey')}>
                  설문으로 돌아가기
                </button>
              </div>
            );
          }
          return <Leaderboard onBack={() => setCurrentView('survey')} />;

        case 'admin':
          if (!AdminPanel) {
            return (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>❌ AdminPanel 컴포넌트를 불러올 수 없습니다</h2>
                <p>파일이 없거나 에러가 있습니다.</p>
                <button onClick={() => setCurrentView('survey')}>
                  설문으로 돌아가기
                </button>
              </div>
            );
          }
          return <AdminPanel onBack={() => setCurrentView('survey')} />;

        default:
          return <WelcomeScreen onStart={() => setCurrentView('survey')} />;
      }
    } catch (error) {
      console.error('🔴 렌더링 에러:', error);
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>❌ 에러가 발생했습니다</h2>
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
