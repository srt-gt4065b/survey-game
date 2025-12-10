import React, { useEffect, useMemo, useState } from "react";
//import GameHeader from "./GameHeader";   // ← 반드시 여기!
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase/config";
import useGameStore from "../store/gameStore";
import QuestionCard from "./QuestionCard";
import LayoutWrapper from "./LayoutWrapper.jsx";
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
  const [chapterCompleted, setChapterCompleted] = useState(false);

  // ----------------------------
  // 1. Firestore에서 질문 로딩
  // ----------------------------
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);

        const q = query(collection(db, "questions"), orderBy("id"));
        const snap = await getDocs(q);

        const list = snap.docs.map((doc) => ({
          docId: doc.id, // React key용 안전한 ID
          ...doc.data(),
        }));

        setQuestions(list);

        if (list.length > 0) {
          setCurrentCategory(list[0].category);
        }
      } catch (err) {
        console.error("❌ 설문 로딩 실패:", err);
      } finally {
        setLoading(false);
        setStartTime(Date.now());
      }
    };

    loadQuestions();
  }, []);

  // ----------------------------
  // 2. 카테고리 그룹핑
  // ----------------------------
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

  // ----------------------------
  // 3. 답변 처리
  // ----------------------------
  const handleAnswer = (value) => {
    if (!currentQuestion) return;

    const now = Date.now();
    const timeSpent = (now - startTime) / 1000;

    const qId = currentQuestion.docId; // ← 핵심! 안전한 ID 사용

    setAnswers((prev) => ({
      ...prev,
      [qId]: { value, timeSpent },
    }));

    // 게임 점수 / 레벨 업데이트
    answerQuestion(timeSpent, "good");

    const next = currentIndex + 1;

    if (next < filteredQuestions.length) {
      setCurrentIndex(next);
      setStartTime(Date.now());
      return;
    }

    // 챕터 완료 처리
    setChapterCompleted(true);
    toast.success(`📌 ${currentCategory} Completed`);

    setTimeout(() => {
      setChapterCompleted(false);

      const answeredIds = new Set(Object.keys({ ...answers, [qId]: true }));

      const remainingCats = categories.filter((cat) =>
        questions.some((q) => q.category === cat && !answeredIds.has(q.docId))
      );

      if (remainingCats.length > 0) {
        setCurrentCategory(remainingCats[0]);
        setCurrentIndex(0);
        setStartTime(Date.now());
        return;
      }

      toast.success("🎉 All survey completed!");
      if (onComplete) onComplete();
    }, 1800);
  };

  // ----------------------------
  // 4. 언어 설정
  // ----------------------------
  const lang = user?.language || "en";

  if (loading) return <LayoutWrapper>Loading…</LayoutWrapper>;

  if (chapterCompleted) {
    const chapterNum = categories.indexOf(currentCategory) + 1 || 1;

    return (
      <LayoutWrapper>
        <ChapterComplete
          chapterNumber={chapterNum}
          points={gameStats.experience}
        />
      </LayoutWrapper>
    );
  }

  if (!currentQuestion)
    return <LayoutWrapper>No questions available</LayoutWrapper>;

  const formatted = {
    text: currentQuestion.text?.[lang] || currentQuestion.text?.en,
    section: currentQuestion.category,
    type: currentQuestion.type,
    options: currentQuestion.options || [],
    required: true,
  };

  const progress = Math.round(
    ((currentIndex + 1) / filteredQuestions.length) * 100
  );

  return (
  <LayoutWrapper progress={progress} chapter={currentCategory}>
     <QuestionCard
      key={currentQuestion.docId}
      question={formatted}
      questionNumber={currentIndex + 1}
      totalQuestions={filteredQuestions.length}
      onAnswer={handleAnswer}
    />
  </LayoutWrapper>
);
};

export default SurveyGame;
