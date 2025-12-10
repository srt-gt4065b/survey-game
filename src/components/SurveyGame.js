import React, { useEffect, useMemo, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase/config";
import useGameStore from "../store/gameStore";
import QuestionCard from "./QuestionCard";
import LayoutWrapper from "./LayoutWrapper";
import ChapterComplete from "./ChapterComplete";
import toast from "react-hot-toast";
import "./SurveyGame.css";

const SurveyGame = ({ onComplete }) => {
  const { user, answerQuestion, gameStats } = useGameStore();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [startTime, setStartTime] = useState(Date.now());

  // 🔥 NEW: 챕터 완료 애니메이션 표시 여부
  const [chapterCompleted, setChapterCompleted] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, "questions"), orderBy("id"));
        const snap = await getDocs(q);

        const list = snap.docs.map((doc) => ({ docId: doc.id, ...doc.data() }));
        setQuestions(list);

        if (list.length > 0) {
          setCurrentCategory(list[0].category);
        }
      } finally {
        setLoading(false);
        setStartTime(Date.now());
      }
    };

    load();
  }, []);

  const categories = useMemo(
    () => [...new Set(questions.map((q) => q.category))],
    [questions]
  );

  const filteredQuestions = useMemo(
    () => questions.filter((q) => q.category === currentCategory),
    [questions, currentCategory]
  );

  const currentQuestion =
    filteredQuestions.length > 0 ? filteredQuestions[currentIndex] : null;

  const handleAnswer = (value) => {
    if (!currentQuestion) return;

    const now = Date.now();
    const timeSpent = (now - startTime) / 1000;

    const qId = currentQuestion.id;

    setAnswers((prev) => ({
      ...prev,
      [qId]: { value, timeSpent },
    }));

    answerQuestion(timeSpent, "good");

    const next = currentIndex + 1;

    // ⏭ 다음 문제로 넘어가기
    if (next < filteredQuestions.length) {
      setCurrentIndex(next);
      setStartTime(Date.now());
      return;
    }

    // 🎉 지금 섹션 끝남
    toast.success(`📌 ${currentCategory} Completed`);

    // 🔥 NEW: 챕터 완료 화면 먼저 띄우기
    setChapterCompleted(true);

    // 2초 후 다음 섹션으로 이동
    setTimeout(() => {
      setChapterCompleted(false);

      const answeredIds = new Set(Object.keys({ ...answers, [qId]: true }));

      const remaining = categories.filter((cat) =>
        questions.some((q) => q.category === cat && !answeredIds.has(q.id))
      );

      if (remaining.length > 0) {
        setCurrentCategory(remaining[0]);
        setCurrentIndex(0);
        setStartTime(Date.now());
        return;
      }

      // 전체 완료
      toast.success("🎉 All Survey Completed!");
      if (onComplete) onComplete();
    }, 2000);
  };

  const language = user?.language || "en";
  if (loading) return <LayoutWrapper>Loading…</LayoutWrapper>;

  // 🔥 NEW: 챕터 완료 애니메이션 표시 시에는 QuestionCard 대신 이것만 보여줌
  if (chapterCompleted) {
    const chapterNum =
      categories.indexOf(currentCategory) + 1 || 1;

    return (
      <LayoutWrapper>
        <ChapterComplete
          chapterNumber={chapterNum}
          points={gameStats?.experience ?? 0}
        />
      </LayoutWrapper>
    );
  }

  if (!currentQuestion)
    return <LayoutWrapper>No questions available</LayoutWrapper>;

  const formatted = {
    text: currentQuestion.text?.[language] || currentQuestion.text?.en,
    section: currentQuestion.category,
    type: currentQuestion.type,
    options: currentQuestion.options || [],
    required: true,
  };

  return (
    <LayoutWrapper>
      {/* 상단 인포 바 */}
      <div className="survey-info-bar">
        <div className="info-section">
          Section: <strong>{currentCategory}</strong>
        </div>
        <div className="info-progress">
          Q{currentIndex + 1} / {filteredQuestions.length}
        </div>
      </div>

      <QuestionCard
        key={currentQuestion.id}
        question={formatted}
        questionNumber={currentIndex + 1}
        totalQuestions={filteredQuestions.length}
        onAnswer={handleAnswer}
      />
    </LayoutWrapper>
  );
};

export default SurveyGame;
