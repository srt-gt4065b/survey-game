// App.js
import React, { useState, useEffect } from "react";
import "./App.css";

import useGameStore from "./store/gameStore";

// 라우터 & 어드민 페이지
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminPage from "./components/AdminPage";

// 게임 화면들
import WelcomeScreen from "./components/WelcomeScreen";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import Confetti from "react-confetti";

// 🔐 동적 import (빌드 에러 방지용)
let SurveyGame = null;
let Leaderboard = null;
let AdminPanel = null;

try {
  // eslint-disable-next-line global-require
  SurveyGame = require("./components/SurveyGame").default;
} catch (e) {
  console.error("❌ SurveyGame load error:", e);
}

try {
  // eslint-disable-next-line global-require
  Leaderboard = require("./components/Leaderboard").default;
} catch (e) {
  console.error("❌ Leaderboard load error:", e);
}

try {
  // eslint-disable-next-line global-require
  AdminPanel = require("./components/AdminPanel").default;
} catch (e) {
  console.error("❌ AdminPanel load error:", e);
}

/**
 * 🎮 메인 게임 셸
 *  - Welcome → Survey → Leaderboard → AdminPanel
 *  - 레벨업 시 Confetti + Toast
 */
function MainGame() {
  const { user, gameStats } = useGameStore();

  const [currentView, setCurrentView] = useState("welcome");
  const [showConfetti, setShowConfetti] = useState(false);

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // 🔄 윈도우 사이즈 추적
  useEffect(() => {
    const resize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // 🎉 레벨업 효과
  useEffect(() => {
    if (gameStats?.level > 1) {
      setShowConfetti(true);
      toast.success(`🎉 Level ${gameStats.level} reached!`, {
        duration: 3000,
        position: "top-center",
      });
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [gameStats?.level]);

  // 🧭 화면 전환 로직
  const renderScreen = () => {
    switch (currentView) {
      case "welcome":
        return <WelcomeScreen onStart={() => setCurrentView("survey")} />;

      case "survey":
        if (!SurveyGame) return <div>SurveyGame Not Found</div>;
        return (
          <SurveyGame onComplete={() => setCurrentView("leaderboard")} />
        );

      case "leaderboard":
        if (!Leaderboard) return <div>Leaderboard Not Found</div>;
        return (
          <Leaderboard onBack={() => setCurrentView("survey")} />
        );

      case "admin":
        if (!AdminPanel) return <div>AdminPanel Not Found</div>;
        return <AdminPanel onBack={() => setCurrentView("survey")} />;

      default:
        return <WelcomeScreen onStart={() => setCurrentView("survey")} />;
    }
  };

  return (
    <div className="App">
      {/* 🎉 레벨업 효과 */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
        />
      )}

      {/* 🔔 Toast */}
      <Toaster />

      {/* 📺 메인 콘텐츠 */}
      <div className="main-content">{renderScreen()}</div>
    </div>
  );
}

/**
 * 🧭 최상위 App
 *  - "/"      → MainGame (설문 게임)
 *  - "/admin" → AdminPage (Firestore 설문 관리용)
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainGame />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}
