import { create } from "zustand";

const initialUser = {
  id: "",
  name: "",
  studentId: "",
  department: "",
  avatar: "🎓",
  language: "en",
  isAdmin: false,
};

const useGameStore = create((set, get) => ({
  // ============================================================
  // USER
  // ============================================================
  user: initialUser,

  setUser: (partial) =>
    set((state) => ({
      user: { ...state.user, ...partial },
    })),

  setLanguage: (language) =>
    set((state) => ({
      user: { ...state.user, language },
    })),

  // ============================================================
  // GAME STATS (🔥게임형 구조 복원)
  // ============================================================
  gameStats: {
    level: 1,
    experience: 0,        // ⭐ GameHeader에서 필요
    coins: 0,             // ⭐ GameHeader에서 필요
    streak: 0,
    questionsAnswered: 0,

    // 전체 문항 수 → 나중에 survey fetch 후 update 가능
    totalQuestions: 168,  // ⭐ GameHeader에서 필요

    currentChapter: 1,    // ⭐ GameHeader에서 필요
  },

  // 경험치 / 코인 / 질문 카운트 로직
 // 경험치 / 코인 / 질문 카운트 로직
  answerQuestion: (timeSpent, quality) => {
    const stats = get().gameStats;
    let exp = 10;
    let coins = 1;

    if (quality === "perfect") {
      exp = 20;
      coins = 3;
    } else if (quality === "good") {
      exp = 15;
      coins = 2;
    }

    if (timeSpent < 3) {
      exp += 5; // 보너스
      coins += 1;
    }

    let newExp = stats.experience + exp;
    const newCoins = stats.coins + coins;
    let newLevel = stats.level;

    // ✅ 레벨업 처리: 100 이상이면 레벨업하고 경험치 리셋
    while (newExp >= 100) {
      newExp -= 100; // 경험치를 100 빼기
      newLevel += 1; // 레벨업
    }

    set({
      gameStats: {
        ...stats,
        experience: newExp,
        coins: newCoins,
        questionsAnswered: stats.questionsAnswered + 1,
        level: newLevel,
      },
    });

    const levelUp = newLevel > stats.level;

    return { exp, coins, levelUp };
  },

  updateStreak: (correct) =>
    set((state) => ({
      gameStats: {
        ...state.gameStats,
        streak: correct ? state.gameStats.streak + 1 : 0,
      },
    })),

  setTotalQuestions: (count) =>
    set((state) => ({
      gameStats: {
        ...state.gameStats,
        totalQuestions: count,
      },
    })),

  completeChapter: (chapter) => {
    console.log("챕터 완료:", chapter);
  },

  resetGame: () =>
    set({
      gameStats: {
        level: 1,
        experience: 0,
        coins: 0,
        streak: 0,
        questionsAnswered: 0,
        totalQuestions: 168,
        currentChapter: 1,
      },
    }),
}));

export default useGameStore;
