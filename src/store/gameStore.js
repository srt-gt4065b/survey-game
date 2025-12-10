// 게임화 요소 상태 관리 (Zustand)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useGameStore = create(
  persist(
    (set, get) => ({
      // 👤 사용자 정보
      user: {
        id: null,
        name: '',
        studentId: '',
        department: '',
        avatar: '🎓',
        team: null,
      },
      
      // 🎮 게임 상태
      gameStats: {
        level: 1,
        experience: 0,
        totalPoints: 0,
        streak: 0,
        questionsAnswered: 0,
        totalQuestions: 150,
        currentChapter: 1,
        completedChapters: [],
      },
      
      // 🏆 업적 & 배지
      achievements: [],
      badges: [],
      
      // 💎 보상
      rewards: {
        coins: 0,
        gems: 0,
        items: [],
      },
      
      // ⏱️ 시간 추적
      timeTracking: {
        startTime: null,
        totalTime: 0,
        averageTimePerQuestion: 0,
      },
      
      // 📊 리더보드 순위
      ranking: {
        personal: null,
        department: null,
        overall: null,
      },

      // 🎯 액션 함수들
      setUser: (userData) => set({ user: { ...get().user, ...userData } }),
      
      // 경험치 & 레벨업
      addExperience: (exp) => {
        const currentStats = get().gameStats;
        const newExp = currentStats.experience + exp;
        const newTotal = currentStats.totalPoints + exp;
        
        // 레벨업 계산 (100 XP당 1레벨)
        const newLevel = Math.floor(newTotal / 100) + 1;
        const leveledUp = newLevel > currentStats.level;
        
        set({
          gameStats: {
            ...currentStats,
            experience: newExp % 100,
            totalPoints: newTotal,
            level: newLevel,
          }
        });
        
        if (leveledUp) {
          get().unlockAchievement('LEVEL_UP');
          get().addReward('coins', 50);
        }
        
        return leveledUp;
      },
      
      // 연속 답변 (Streak)
      updateStreak: (correct) => {
        const currentStreak = get().gameStats.streak;
        if (correct) {
          const newStreak = currentStreak + 1;
          set({
            gameStats: {
              ...get().gameStats,
              streak: newStreak,
            }
          });
          
          // 연속 답변 보상
          if (newStreak === 5) get().unlockAchievement('STREAK_5');
          if (newStreak === 10) get().unlockAchievement('STREAK_10');
          if (newStreak === 20) get().unlockAchievement('STREAK_MASTER');
        } else {
          set({
            gameStats: {
              ...get().gameStats,
              streak: 0,
            }
          });
        }
      },
      
      // 질문 답변 처리
      answerQuestion: (timeSpent, quality = 'good') => {
        const stats = get().gameStats;
        
        // 기본 포인트
        let points = 10;
        
        // 시간 보너스 (10초 이내 답변)
        if (timeSpent < 10) points += 5;
        
        // 품질 보너스
        if (quality === 'excellent') points += 10;
        else if (quality === 'good') points += 5;
        
        // 연속 보너스
        if (stats.streak >= 5) points *= 1.5;
        if (stats.streak >= 10) points *= 2;
        
        // 상태 업데이트
        set({
          gameStats: {
            ...stats,
            questionsAnswered: stats.questionsAnswered + 1,
          }
        });
        
        // 경험치 추가
        const leveledUp = get().addExperience(Math.floor(points));
        
        return {
          points: Math.floor(points),
          leveledUp,
          newTotal: get().gameStats.totalPoints
        };
      },
      
      // 챕터 완료
      completeChapter: (chapterNumber) => {
        const stats = get().gameStats;
        
        if (!stats.completedChapters.includes(chapterNumber)) {
          set({
            gameStats: {
              ...stats,
              completedChapters: [...stats.completedChapters, chapterNumber],
              currentChapter: chapterNumber + 1,
            }
          });
          
          // 챕터 완료 보상
          get().addReward('coins', 100);
          get().addReward('gems', 10);
          get().unlockAchievement(`CHAPTER_${chapterNumber}_COMPLETE`);
        }
      },
      
      // 업적 해제
      unlockAchievement: (achievementId) => {
        const achievements = get().achievements;
        if (!achievements.includes(achievementId)) {
          set({
            achievements: [...achievements, achievementId],
          });
          
          // 업적 보상
          const achievementRewards = {
            'FIRST_ANSWER': { coins: 10 },
            'LEVEL_UP': { coins: 50, gems: 5 },
            'STREAK_5': { coins: 30 },
            'STREAK_10': { coins: 50, gems: 10 },
            'STREAK_MASTER': { coins: 100, gems: 20 },
            'SPEED_DEMON': { coins: 40 },
            'PERFECTIONIST': { coins: 80, gems: 15 },
          };
          
          const reward = achievementRewards[achievementId];
          if (reward) {
            if (reward.coins) get().addReward('coins', reward.coins);
            if (reward.gems) get().addReward('gems', reward.gems);
          }
          
          return true;
        }
        return false;
      },
      
      // 보상 추가
      addReward: (type, amount) => {
        const rewards = get().rewards;
        set({
          rewards: {
            ...rewards,
            [type]: rewards[type] + amount,
          }
        });
      },
      
      // 배지 획득
      earnBadge: (badgeId) => {
        const badges = get().badges;
        if (!badges.includes(badgeId)) {
          set({
            badges: [...badges, badgeId],
          });
          return true;
        }
        return false;
      },
      
      // 게임 리셋 (새 설문 시작)
      resetGame: () => {
        set({
          gameStats: {
            level: 1,
            experience: 0,
            totalPoints: 0,
            streak: 0,
            questionsAnswered: 0,
            totalQuestions: 150,
            currentChapter: 1,
            completedChapters: [],
          },
          achievements: [],
          timeTracking: {
            startTime: Date.now(),
            totalTime: 0,
            averageTimePerQuestion: 0,
          },
        });
      },
    }),
    {
      name: 'survey-game-storage', // 로컬 스토리지 키
    }
  )
);

export default useGameStore;

// 업적 정의
export const ACHIEVEMENTS = {
  FIRST_ANSWER: {
    id: 'FIRST_ANSWER',
    name: '첫 발걸음',
    description: '첫 질문에 답변하기',
    icon: '👶',
    points: 10,
  },
  LEVEL_UP: {
    id: 'LEVEL_UP',
    name: '레벨 업!',
    description: '레벨을 올리다',
    icon: '⬆️',
    points: 50,
  },
  STREAK_5: {
    id: 'STREAK_5',
    name: '연속 5개',
    description: '5개 질문 연속 답변',
    icon: '🔥',
    points: 30,
  },
  STREAK_10: {
    id: 'STREAK_10',
    name: '열정적인 참여자',
    description: '10개 질문 연속 답변',
    icon: '💥',
    points: 50,
  },
  STREAK_MASTER: {
    id: 'STREAK_MASTER',
    name: '연속 답변 마스터',
    description: '20개 질문 연속 답변',
    icon: '👑',
    points: 100,
  },
  SPEED_DEMON: {
    id: 'SPEED_DEMON',
    name: '스피드 악마',
    description: '10초 이내 답변 10회',
    icon: '⚡',
    points: 40,
  },
  PERFECTIONIST: {
    id: 'PERFECTIONIST',
    name: '완벽주의자',
    description: '모든 질문에 성실하게 답변',
    icon: '💎',
    points: 80,
  },
};

// 배지 정의
export const BADGES = {
  EARLY_BIRD: {
    id: 'EARLY_BIRD',
    name: '얼리버드',
    description: '오전 9시 이전 참여',
    icon: '🐤',
    rarity: 'common',
  },
  NIGHT_OWL: {
    id: 'NIGHT_OWL',
    name: '올빼미',
    description: '밤 10시 이후 참여',
    icon: '🦉',
    rarity: 'common',
  },
  WEEKEND_WARRIOR: {
    id: 'WEEKEND_WARRIOR',
    name: '주말 전사',
    description: '주말에 설문 완료',
    icon: '⚔️',
    rarity: 'rare',
  },
  SPEEDSTER: {
    id: 'SPEEDSTER',
    name: '스피드스터',
    description: '전체 평균보다 50% 빠르게 완료',
    icon: '🏃',
    rarity: 'epic',
  },
  COMPLETIONIST: {
    id: 'COMPLETIONIST',
    name: '완성주의자',
    description: '모든 질문 답변 완료',
    icon: '✅',
    rarity: 'legendary',
  },
};
