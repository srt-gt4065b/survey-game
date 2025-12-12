import React, { useEffect, useMemo, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase/config";
import useGameStore from "../store/gameStore";
import QuestionCard from "./QuestionCard";
import GameHeader from "./GameHeader";
import toast from "react-hot-toast";
import "./SurveyGame.css";

/** ---------------------------
 * 옵션 문자열 → 배열 변환
 * Firestore가 문자열/배열 혼용돼도 항상 정상 처리
 ----------------------------*/
const getOptionsArray = (options) => {
  if (!options) return [];
  if (Array.isArray(options)) return options;

  // 문자열인 경우 | 또는 , 로 구분
  return options
    .split(/[\|,]/g)
    .map((o) => o.trim())
    .filter((o) => o.length > 0);
};

const SurveyGame = ({ onComplete }) => {
  const { user, answerQuestion } = useGameStore();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // 현재 카테고리 / 문항 인덱스
  const [currentCategory, setCurrentCategory] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  // 답변 기록
  const [answers, setAnswers] = useState({});
  const [startTime, setStartTime] = useState(Date.now());

  const lang = user?.language || "en";

  /** ---------------------------
   * Firestore에서 질문 목록 로딩
   ----------------------------*/
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);

        const q = query(collection(db, "questions"), orderBy("id"));
        const snap = await getDocs(q);

        const list = snap.docs.map((doc) => ({
          docId: doc.id,
          ...doc.data(),
        }));

        setQuestions(list);

        // ★ 첫 카테고리 자동 설정
        if (list.length > 0) {
          setCurrentCategory(list[0].category);
        }
      } catch (err) {
        console.error("❌ Failed to load questions:", err);
        toast.error("Failed to load questions");
      } finally {
        setLoading(false);
        setStartTime(Date.now());
      }
    };

    loadQuestions();
  }, []);

  /** ---------------------------
   * 카테고리 목록
   ----------------------------*/
  const categories = useMemo(
    () => [...new Set(questions.map((q) => q.category))],
    [questions]
  );

  /** ---------------------------
   * 현재 카테고리에서의 문항 필터링
   ----------------------------*/
  const filteredQuestions = useMemo(
    () => questions.filter((q) => q.category === currentCategory),
    [questions, currentCategory]
  );

  const currentQuestion =
    filteredQuestions.length > 0 ? filteredQuestions[currentIndex] : null;

  /** ---------------------------
   * 전체 진행률 계산 (헤더 표시용)
   ----------------------------*/
  const overallProgress = useMemo(() => {
    const answeredCount = Object.keys(answers).length;
    return { current: answeredCount, total: questions.length };
  }, [answers, questions.length]);

  /** ---------------------------
   * 전체 문항 중 현재 문항의 절대 번호
   ----------------------------*/
  const getCurrentOverallNumber = () => {
    if (!currentQuestion) return 0;
    return questions.findIndex((q) => q.docId === currentQuestion.docId) + 1;
  };

  /** ---------------------------
   * 답변 처리
   ----------------------------*/
  const handleAnswer = (value) => {
    if (!currentQuestion) return;

    const now = Date.now();
    const timeSpent = (now - startTime) / 1000;
    const qId = currentQuestion.docId;

    // 기록 저장
    setAnswers((prev) => ({
      ...prev,
      [qId]: { value, timeSpent },
    }));

    // 점수/경험치 반영
    answerQuestion(timeSpent, "good");

    // 다음 문항
    const nextIndex = currentIndex + 1;

    if (nextIndex < filteredQuestions.length) {
      setCurrentIndex(nextIndex);
      setStartTime(Date.now());
      return;
    }

    /** ---------------------------
     * 현재 카테고리 종료
     ----------------------------*/
    toast.success(`🎉 ${currentCategory} 완료!`);

    // 이미 답한 문항 ID 집합
    const answeredIds = new Set(
      Object.keys({ ...answers, [qId]: true })
    );

    // 아직 풀지 않은 카테고리 찾기
    const remainingCats = categories.filter((cat) =>
      questions.some(
        (q) => q.category === cat && !answeredIds.has(q.docId)
      )
    );

    // 다음 카테고리로 이동
    if (remainingCats.length > 0) {
      setCurrentCategory(remainingCats[0]);
      setCurrentIndex(0);
      setStartTime(Date.now());
      return;
    }

    /** ---------------------------
     * 전체 설문 종료
     ----------------------------*/
    toast.success("🎯 All survey completed!");
    if (onComplete) onComplete();
  };

  /** ---------------------------
   * 로딩 화면
   ----------------------------*/
  if (loading) {
    return (
      <div className="survey-container">
        <div className="loading-screen">Loading questions...</div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="survey-container">
        <div className="loading-screen">No questions available</div>
      </div>
    );
  }

  /** ---------------------------
   * QuestionCard 전달용 정제 데이터
   ----------------------------*/
  const formatted = {
    text: currentQuestion.text?.[lang] || currentQuestion.text?.en,
    section: currentQuestion.category,
    type: currentQuestion.type,
    options: getOptionsArray(currentQuestion.options),
    required: true,
  };

  return (
    <div className="survey-container">
      <GameHeader overallProgress={overallProgress} />

      <QuestionCard
        key={currentQuestion.docId}
        question={formatted}
        questionNumber={currentIndex + 1}
        totalQuestions={filteredQuestions.length}
        overallNumber={getCurrentOverallNumber()}
        overallTotal={questions.length}
        onAnswer={handleAnswer}
      />
    </div>
  );
};

export default SurveyGame;
