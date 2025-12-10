import React, { useEffect, useMemo, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase/config";
import useGameStore from "../store/gameStore";
import QuestionCard from "./QuestionCard";
import toast from "react-hot-toast";
import LayoutWrapper from "./LayoutWrapper";
import "./SurveyGame.css";

const SurveyGame = ({ onComplete }) => {
  const { user, answerQuestion } = useGameStore();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [startTime, setStartTime] = useState(Date.now());

  // Firestore Load
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, "questions"), orderBy("id"));
        const snap = await getDocs(q);
        const list = snap.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
        setQuestions(list);

        if (list.length > 0) setCurrentCategory(list[0].category);
      } finally {
        setLoading(false);
        setStartTime(Date.now());
      }
    };
    load();
  }, []);

  const categories = useMemo(
    () => [...new Set(questions.map(q => q.category))],
    [questions]
  );

  const filteredQuestions = useMemo(
    () => questions.filter(q => q.category === currentCategory),
    [questions, currentCategory]
  );

  useEffect(() => {
    setCurrentIndex(0);
    setStartTime(Date.now());
  }, [currentCategory]);

  const currentQuestion =
    filteredQuestions.length > 0 ? filteredQuestions[currentIndex] : null;

  const handleAnswer = (value) => {
    if (!currentQuestion) return;

    const now = Date.now();
    const timeSpent = (now - startTime) / 1000;

    const qId = currentQuestion.id;
    setAnswers(prev => ({ ...prev, [qId]: { value, timeSpent } }));

    answerQuestion(timeSpent, "good");

    const next = currentIndex + 1;

    if (next < filteredQuestions.length) {
      setCurrentIndex(next);
      setStartTime(Date.now());
      return;
    }

    toast.success(`📌 ${currentCategory} Completed`);

    const answeredIds = new Set(Object.keys({ ...answers, [qId]: true }));
    const remaining = categories.filter(cat =>
      questions.some(q => q.category === cat && !answeredIds.has(q.id))
    );

    if (remaining.length > 0) {
      setCurrentCategory(remaining[0]);
      return;
    }

    toast.success("🎉 All Survey Completed!");
    if (onComplete) onComplete();
  };

  const language = user?.language || "en";

  if (loading) return <LayoutWrapper>Loading…</LayoutWrapper>;
  if (!currentQuestion) return <LayoutWrapper>No questions available</LayoutWrapper>;

  const formatted = {
    text: currentQuestion.text?.[language] || currentQuestion.text?.en,
    section: currentQuestion.category,
    type: currentQuestion.type,
    options: currentQuestion.options || [],
    required: true
  };

  return (
    <LayoutWrapper>
      {/* 🔥 GameHeader 바로 아래 연결되는 "설문 인포 바" */}
      <div className="survey-info-bar">
        <div className="info-section">Section: <strong>{currentCategory}</strong></div>
        <div className="info-progress">Q{currentIndex + 1} / {filteredQuestions.length}</div>
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
