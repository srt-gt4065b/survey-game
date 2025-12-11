// src/components/AdminPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import toast from "react-hot-toast";
import "./AdminPage.css"; // 스타일은 아래에 예시 제공

const LANG_OPTIONS = [
  { value: "en", label: "EN" },
  { value: "ko", label: "KO" },
  { value: "zh", label: "ZH" },
  { value: "kk", label: "KK" },
  { value: "uz", label: "UZ" },
  { value: "bn", label: "BN" },
];

const TYPE_OPTIONS = [
  { value: "all", label: "likert / text / multi" },
  { value: "likert", label: "likert" },
  { value: "text", label: "text" },
  { value: "multi", label: "multi" },
];

function AdminPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState("zh");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("all");

  const [editingQuestion, setEditingQuestion] = useState(null);

  // ---------- Firestore에서 질문 목록 로드 ----------
  const loadQuestions = async () => {
    try {
      setLoading(true);
      const qRef = collection(db, "questions");
      const q = query(qRef, orderBy("id", "asc"));
      const snap = await getDocs(q);

      const list = snap.docs.map((d) => ({
        docId: d.id, // Firestore 실제 문서 ID
        ...d.data(),
      }));

      setQuestions(list);
    } catch (err) {
      console.error(err);
      toast.error("질문 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  // ---------- 필터링 ----------
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const byType = filterType === "all" ? true : q.type === filterType;
      const byCategory = filterCategory
        ? q.category
            ?.toLowerCase()
            .includes(filterCategory.toLowerCase())
        : true;
      return byType && byCategory;
    });
  }, [questions, filterCategory, filterType]);

  // ---------- 삭제 ----------
  const handleDelete = async (question) => {
    const ok = window.confirm(
      `${question.id} (${question.category}) 문항을 정말 삭제할까요?`
    );
    if (!ok) return;

    try {
      await deleteDoc(doc(db, "questions", question.docId));
      setQuestions((prev) =>
        prev.filter((q) => q.docId !== question.docId)
      );
      toast.success("삭제 완료");
    } catch (err) {
      console.error(err);
      toast.error("삭제 중 오류가 발생했습니다.");
    }
  };

  // ---------- 저장 (Update) ----------
  const handleSave = async () => {
    if (!editingQuestion) return;

    try {
      const { docId, ...payload } = editingQuestion; // docId 분리하고 나머지만 저장
      await updateDoc(doc(db, "questions", docId), payload);

      // 로컬 상태 동기화
      setQuestions((prev) =>
        prev.map((q) => (q.docId === docId ? editingQuestion : q))
      );

      toast.success("Firebase에 저장되었습니다 ✅");
      setEditingQuestion(null);
    } catch (err) {
      console.error(err);
      toast.error("저장 실패 ❌");
    }
  };

  // ---------- 편집 패널 ----------
  const renderEditPanel = () => {
    if (!editingQuestion) return null;

    const q = editingQuestion;
    const lang = selectedLanguage;

    return (
      <div className="ap-edit-panel">
        <h3>
          Edit Question – <span>{q.id}</span>
        </h3>

        <div className="ap-edit-row">
          <label>ID</label>
          <input
            type="text"
            value={q.id}
            onChange={(e) =>
              setEditingQuestion({ ...q, id: e.target.value })
            }
          />
        </div>

        <div className="ap-edit-row">
          <label>Category</label>
          <input
            type="text"
            value={q.category || ""}
            onChange={(e) =>
              setEditingQuestion({ ...q, category: e.target.value })
            }
          />
        </div>

        <div className="ap-edit-row">
          <label>Type</label>
          <select
            value={q.type || "likert"}
            onChange={(e) =>
              setEditingQuestion({ ...q, type: e.target.value })
            }
          >
            <option value="likert">likert</option>
            <option value="text">text</option>
            <option value="multi">multi</option>
          </select>
        </div>

        <div className="ap-edit-row">
          <label>Question ({lang})</label>
          <textarea
            rows={3}
            value={q.text?.[lang] || ""}
            onChange={(e) =>
              setEditingQuestion({
                ...q,
                text: {
                  ...(q.text || {}),
                  [lang]: e.target.value,
                },
              })
            }
          />
        </div>

        {q.type === "likert" || q.type === "multi" ? (
          <div className="ap-edit-row">
            <label>Options (공통, | 로 분리)</label>
            <textarea
              rows={2}
              value={(q.options || []).join(" | ")}
              onChange={(e) =>
                setEditingQuestion({
                  ...q,
                  options: e.target.value
                    .split("|")
                    .map((s) => s.trim())
                    .filter((s) => s.length > 0),
                })
              }
            />
            <small>
              예시: 🙄 Strongly Disagree | 😐 Neutral | 😍 Strongly Agree
            </small>
          </div>
        ) : null}

        <div className="ap-edit-actions">
          <button
            className="ap-btn ap-btn-secondary"
            onClick={() => setEditingQuestion(null)}
          >
            취소
          </button>
          <button className="ap-btn ap-btn-primary" onClick={handleSave}>
            💾 Save Changes
          </button>
        </div>
      </div>
    );
  };

  // ---------- 메인 렌더링 ----------
  return (
    <div className="ap-root">
      <header className="ap-header">
        <div className="ap-title">
          <span role="img" aria-label="clipboard">
            📋
          </span>{" "}
          Survey Admin Panel
        </div>

        <div className="ap-filters">
          <div className="ap-filter-group">
            <label>Language:</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              {LANG_OPTIONS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <div className="ap-filter-group">
            <label>Category:</label>
            <input
              type="text"
              placeholder="e.g. Personal Background"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            />
          </div>

          <div className="ap-filter-group">
            <label>Type:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <button className="ap-btn" onClick={loadQuestions}>
            🔄 Reload
          </button>
        </div>
      </header>

      {loading ? (
        <div className="ap-loading">Loading questions...</div>
      ) : (
        <div className="ap-table-wrapper">
          <table className="ap-table">
            <thead>
              <tr>
                <th style={{ width: "70px" }}>ID</th>
                <th style={{ width: "220px" }}>Category</th>
                <th style={{ width: "80px" }}>Type</th>
                <th>Question ({selectedLanguage})</th>
                <th style={{ width: "80px" }}>Edit</th>
                <th style={{ width: "80px" }}>Del</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuestions.map((q) => (
                <tr key={q.docId}>
                  <td>{q.id}</td>
                  <td>{q.category}</td>
                  <td>{q.type}</td>
                  <td>{q.text?.[selectedLanguage] || ""}</td>
                  <td>
                    <button
                      className="ap-icon-btn ap-edit-btn"
                      onClick={() => setEditingQuestion(q)}
                    >
                      ✏️
                    </button>
                  </td>
                  <td>
                    <button
                      className="ap-icon-btn ap-del-btn"
                      onClick={() => handleDelete(q)}
                    >
                      ❌
                    </button>
                  </td>
                </tr>
              ))}

              {filteredQuestions.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 20 }}>
                    검색 조건에 해당하는 문항이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {renderEditPanel()}
    </div>
  );
}

export default AdminPage;
