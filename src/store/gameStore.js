// src/store/gameStore.js
import { create } from "zustand";

const initialUser = {
  id: "",
  name: "",
  studentId: "",
  department: "",
  avatar: "🎓",
  language: "en",     // ✅ 다국어 지원을 위한 기본 언어
  isAdmin: false,
};

const useGameStore = create((set, get) => ({

  // ===========================
  // USER 정보
  // ===========================
  user: initialUser,

  // 기존 setUser → user 전체를 덮어써버리는 문제 있었음
  // ⇒ 병합 방식으로 수정해야 언어/아바타 등이 유지됨
  setUser: (partialUser) =>
    set((state) => ({
      user: { ...state.user, ...partialUser },
    })),

  // 언어 변경 기능 (SurveyGame 다국어 렌더링용)
  setLanguage: (lang) =>
    set((state) => ({
      user: { ...state.user, language: lang },
    })),

  // ===========================
  // 게임 통계 상태
  // ===========================
  gameStats: {
    level: 1,
    streak: 0,
    questionsAnswered: 0,
    points: 0,
    combo: 0,
    highestCombo: 0,
    chapter: 1,
    coins: 0, 
  },

  // 게임 초기화
  resetGame: () =>
    set((state) => ({
      gameStats: {
        level: 1,
        streak: 0,
        questionsAnswered: 0,
        points: 0,
        combo: 0,
        highestCombo: 0,
        chapter: 1,
        
      },
    })),

  // ===========================
  // 답변 처리 (포인트/레벨업/콤보)
  // ===========================
  answerQuestion: (timeSpent, quality = "good") => {
    const current = get().gameStats;

    // 기본 점수
    let basePoints = 5;
    if (quality === "good") basePoints = 10;
    if (quality === "perfect") basePoints = 20;

    // 시간 보너스
    if (timeSpent < 3) basePoints += 5;
    if (timeSpent < 2) basePoints += 5;
    if (timeSpent < 1) basePoints += 10;

    // streak / combo 적용
    const newCombo = current.combo + 1;
    const comboBonus = Math.floor(newCombo / 5) * 10; // 5콤보마다 10점

    const newPoints = current.points + basePoints + comboBonus;

    const leveledUp = newPoints >= current.level * 100;

    set({
      gameStats: {
        ...current,
        points: newPoints,
        questionsAnswered: current.questionsAnswered + 1,
        combo: newCombo,
        highestCombo: Math.max(current.highestCombo, newCombo),
        level: leveledUp ? current.level + 1 : current.level,
      },
    });

    return { points: basePoints + comboBonus, leveledUp };
  },

  // ===========================
  // streak / combo 관리
  // ===========================
  updateStreak: (correct) => {
    const current = get().gameStats;

    if (!correct) {
      // ❗ 틀리면 콤보/스트릭 초기화
      set({
        gameStats: {
          ...current,
          streak: 0,
          combo: 0,
        },
      });
      return;
    }

    // 맞췄으면 streak 증가
    set({
      gameStats: {
        ...current,
        streak: current.streak + 1,
      },
    });
  },

  // ===========================
  // 챕터 (게임식 섹션 개념)
  // ===========================
  completeChapter: (chapterNumber) => {
    const current = get().gameStats;

    set({
      gameStats: {
        ...current,
        chapter: chapterNumber + 1,
      },
    });

    console.log(`🎉 Chapter ${chapterNumber} 완료 → 다음 챕터로 진행`);
  },

  // ===========================
  // 업적 시스템
  // ===========================
  unlockedAchievements: [],

  unlockAchievement: (key) =>
    set((state) => {
      if (state.unlockedAchievements.includes(key)) return state;
      console.log("⭐ 업적 달성:", key);
      return {
        unlockedAchievements: [...state.unlockedAchievements, key],
      };
    }),

  // ===========================
  // 답변 피드백
  // ===========================
  showAnswerFeedback: (points, leveledUp) => {
    console.log(
      `✨ Feedback: +${points}점 / 레벨업:${leveledUp ? "YES" : "NO"}`
    );
  },
}));

export default useGameStore;
