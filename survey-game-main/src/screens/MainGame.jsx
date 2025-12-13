import React, { useState, Suspense } from "react";
import Confetti from "react-confetti";
import { Toaster } from "react-hot-toast";
import useGameStore from "../store/gameStore";
import useLevelUpEffect from "../hooks/useLevelUpEffect";

// Lazy loaded screens
const WelcomeScreen   = React.lazy(() => import("./WelcomeScreen"));
const SurveyGame      = React.lazy(() => import("./SurveyGame"));
const Leaderboard     = React.lazy(() => import("./Leaderboard"));
const AdminPanel      = React.lazy(() => import("./AdminPanel"));

export default function MainGame() {
  const { gameStats } = useGameStore();
  const [view, setView] = useState("welcome");

  const showConfetti = useLevelUpEffect(gameStats?.level || 1);

  const renderView = () => {
    switch (view) {
      case "welcome":
        return <WelcomeScreen onStart={() => setView("survey")} />;

      case "survey":
        return <SurveyGame onComplete={() => setView("leaderboard")} />;

      case "leaderboard":
        return <Leaderboard onBack={() => setView("survey")} />;

      case "admin":
        return <AdminPanel onBack={() => setView("survey")} />;

      default:
        return <WelcomeScreen onStart={() => setView("survey")} />;
    }
  };

  return (
    <div className="app-shell">

      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
        />
      )}

      <Toaster />

      <Suspense fallback={<div className="loading">Loading...</div>}>
        {renderView()}
      </Suspense>
    </div>
  );
}
