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

  // 🔥 Firestore Load
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, "questions"), orderBy("id"));
        const snap = await getDocs(q);
        const data = snap.docs.map((doc) => ({ docId: doc.id, ...doc.data() }));
        setQuestions(data);

        if (data.length > 0) {
          setCurrentCategory(data[0].category || "General");
        }
      } catch (err) {
        console.error(err);
        toast.error("설문 문항을 불러오는 중 오류 발생");
      } finally {
        setLoading(false);
        setStartTime(Date.now());
      }
    };
    fetchQuestions();
  }, []);

  // 🔥 카테고리 자동 계산
  const categories = useMemo(
    () => [...new Set(questions.map((q) => q.category || "General"))],
    [questions]
  );

  const filteredQuestions = useMemo(
    () => questions.filter((q) => q.category === currentCategory),
    [questions, currentCategory]
  );

  useEffect(() => {
    setCurrentIndex(0);
    setStartTime(Date.now());
  }, [currentCategory]);

  const currentQuestion =
    filteredQuestions.length > 0 ? filteredQuestions[currentIndex] : null;

  // 🔥 답변 처리
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

    const nextIndex = currentIndex + 1;

    if (nextIndex < filteredQuestions.length) {
      setCurrentIndex(nextIndex);
      setStartTime(Date.now());
      return;
    }

    toast.success(`📌 ${currentCategory} 완료!`);

    const answeredIds = new Set(Object.keys({ ...answers, [qId]: true }));
    const remaining = categories.filter((cat) =>
      questions.some((q) => q.category === cat && !answeredIds.has(q.id))
    );

    if (remaining.length > 0) {
      setCurrentCategory(remaining[0]);
      return;
    }

    toast.success("🎉 전체 설문 완료!");
    if (onComplete) onComplete();
  };

  // 🔥 언어 처리
  const language = user?.language || "en";

  if (loading) return <div className="survey-game">Loading...</div>;
  if (!currentQuestion) return <div className="survey-game">No questions</div>;

  const formattedQuestion = {
    text: currentQuestion.text?.[language] || currentQuestion.text?.en || "질문 없음",
    section: currentQuestion.category || "General",
    type: currentQuestion.type || "text",
    options: currentQuestion.options || [],
    required: true,
  };

  return (
    <div className="survey-game">

      {/* 📌 상단 진행률 텍스트 UI — 심플/프로 분위기 */}
      <div className="survey-progress">
        <span>Section: <strong>{currentCategory}</strong></span>
        <span>Question {currentIndex + 1} / {filteredQuestions.length}</span>
      </div>

      <QuestionCard
        key={currentQuestion.id}
        question={formattedQuestion}
        questionNumber={currentIndex + 1}
        totalQuestions={filteredQuestions.length}
        onAnswer={handleAnswer}
      />
    </div>
  );
};

export default SurveyGame;
