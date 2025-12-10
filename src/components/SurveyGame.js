// src/components/SurveyGame.js
import React, { useEffect, useMemo, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase/config";
import useGameStore from "../store/gameStore";
import QuestionCard from "./QuestionCard";
import toast from "react-hot-toast";
import "./SurveyGame.css";

const SurveyGame = ({ onComplete }) => {
  const { user, answerQuestion } = useGameStore();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [startTime, setStartTime] = useState(Date.now());

  // ───────────────── Firestore 에서 전체 문항 로딩 ─────────────────
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, "questions"), orderBy("id"));
        const snap = await getDocs(q);
        const data = snap.docs.map((doc) => ({
          docId: doc.id,
          ...doc.data(),
        }));
        setQuestions(data);

        if (data.length > 0) {
          setCurrentCategory(data[0].category || "General");
        }
      } catch (err) {
        console.error(err);
        toast.error("설문 문항을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
        setStartTime(Date.now());
      }
    };

    fetchQuestions();
  }, []);

  // 카테고리 목록
  const categories = useMemo(
    () => [...new Set(questions.map((q) => q.category || "기타"))],
    [questions]
  );

  // 현재 선택된 카테고리의 질문들
  const filteredQuestions = useMemo(
    () =>
      questions.filter(
        (q) => !currentCategory || q.category === currentCategory
      ),
    [questions, currentCategory]
  );

  // 카테고리 바꿀 때 인덱스/시간 초기화
  useEffect(() => {
    setCurrentIndex(0);
    setStartTime(Date.now());
  }, [currentCategory]);

  const currentQuestion =
    filteredQuestions.length > 0 ? filteredQuestions[currentIndex] : null;

  // ───────────────── 답변 처리 ─────────────────
  const handleAnswer = (value) => {
    if (!currentQuestion) return;

    const now = Date.now();
    const timeSpent = (now - startTime) / 1000;

    const qId = currentQuestion.id;

    setAnswers((prev) => ({
      ...prev,
      [qId]: { value, timeSpent },
    }));

    // 점수 계산 (정오답 개념 없이 "good" 으로 통일)
    answerQuestion(timeSpent, "good");

    const nextIndex = currentIndex + 1;

    // 같은 카테고리 안에서 다음 문제
    if (nextIndex < filteredQuestions.length) {
      setCurrentIndex(nextIndex);
      setStartTime(Date.now());
      return;
    }

    // 카테고리 하나 끝났을 때
    toast.success(`✅ "${currentCategory}" 섹션을 완료했습니다.`);

    // 아직 안 푼 카테고리가 있으면 다음 카테고리로 이동
    const answeredIds = new Set(Object.keys({ ...answers, [qId]: true }));
    const remainingCategories = categories.filter((cat) =>
      questions.some((q) => q.category === cat && !answeredIds.has(q.id))
    );

    if (remainingCategories.length > 0) {
      setCurrentCategory(remainingCategories[0]);
      return;
    }

    // 전체 설문 완료
    toast.success("🎉 전체 설문을 모두 완료했습니다!");
    if (onComplete) onComplete();
  };

  const handleCategoryClick = (cat) => {
    setCurrentCategory(cat);
  };

  const language = user.language || "en";

  if (loading) {
    return (
      <div className="survey-game">
        <p>설문 문항을 불러오는 중입니다…</p>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="survey-game">
        <p>표시할 설문 문항이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="survey-game">
      {/* 카테고리 탭 */}
      <div className="category-tabs">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-tab ${
              cat === currentCategory ? "active" : ""
            }`}
            type="button"
            onClick={() => handleCategoryClick(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 진행 상황 */}
      <div className="survey-progress">
        <span>
          섹션: <strong>{currentCategory}</strong>
        </span>
        <span>
          문항 {currentIndex + 1} / {filteredQuestions.length}
        </span>
      </div>

      {/* 실제 질문 카드 (다국어 지원은 QuestionCard 안에서 처리) */}
      <QuestionCard
        key={currentQuestion.id}
        question={currentQuestion}
        language={language}
        onAnswer={handleAnswer}
      />
    </div>
  );
};

export default SurveyGame;
