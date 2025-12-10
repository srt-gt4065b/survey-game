// Firebase 설정 파일
// 김교수님의 Firebase 프로젝트 정보
import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBqp2_7rcy55Et1NkfRMegiLr5eBIt-N-Q",
  authDomain: "ecis-fall2025-survey.firebaseapp.com",
  databaseURL: "https://ecis-fall2025-survey-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ecis-fall2025-survey",
  storageBucket: "ecis-fall2025-survey.firebasestorage.app",
  messagingSenderId: "241188755914",
  appId: "1:241188755914:web:cc9242e9c1ccf0c17f9733"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Analytics를 안전하게 초기화 (measurementId 없어도 에러 안남)
export let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      try {
        analytics = getAnalytics(app);
      } catch (error) {
        console.log('Analytics 비활성화됨');
      }
    }
  }).catch(() => {
    console.log('Analytics 지원 안됨');
  });
}

// 오프라인 지원 활성화 (학생들이 중간에 나갔다 와도 데이터 보존)
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.log('오프라인 지원이 이미 다른 탭에서 활성화되어 있습니다.');
  } else if (err.code === 'unimplemented') {
    console.log('현재 브라우저는 오프라인 지원을 제공하지 않습니다.');
  }
});

// Firestore 컬렉션 이름 상수
export const COLLECTIONS = {
  SURVEYS: 'surveys',
  RESPONSES: 'responses',
  USERS: 'users',
  LEADERBOARD: 'leaderboard',
  ACHIEVEMENTS: 'achievements',
  QUESTIONS: 'questions',
  ANALYTICS: 'analytics'
};

export default app;
