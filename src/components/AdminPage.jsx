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
import "./AdminPage.css";

const LANG_OPTIONS = [
  { value: "en", label: "EN" },
  { value: "ko", label: "KO" },
  { value: "zh", label: "ZH" },
  { value: "kk", label: "KK" },
  { value: "uz", label: "UZ" },
  { value: "bn", label: "BN" },
];

const TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "likert", label: "Likert" },
  { value: "text", label: "Text" },
  { value: "multi", label: "Multi" },
];

function AdminPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState("zh");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("all");

  const [editingQuestion, setEditingQuestion] = useState(null);

  // ⭐ 정렬 상태
  const [sortConfig, setSortConfig] = useState({
    key: "id",
    direction: "asc",
  });

  const onSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  // 🔥 Firestore Load
  const loadQuestions = async () => {
    try {
      setLoading(true);
      const qRef = collection(db, "questions");
      const q = query(qRef, orderBy("id", "asc"));
      const snap = await getDocs(q);

      const list = snap.docs.map((d) => ({
        docId: d.id,
        ...d.data(),
      }));

      setQuestions(list);
    } catch (err) {
      console.error(err);
      toast.error("질문 목록을 불러오는 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  // 🔍 필터 + 정렬 처리
  const filteredQuestions = useMemo(() => {
    let data = [...questions];

    // 필터 처리
    data = data.filter((q) => {
      const byType = filterType === "all" ? true : q.type === filterType;
      const byCategory = filterCategory
        ? q.category.toLowerCase().includes(filterCategory.toLowerCase())
        : true;
      return byType && byCategory;
    });

    // ⭐ 정렬 처리
    if (sortConfig.key) {
      data.sort((a, b) => {
        const aVal =
          sortConfig.key === "question"
            ? a.text?.[selectedLanguage] || ""
            : a[sortConfig.key];
        const bVal =
            sortConfig.key === "question"
            ? b.text?.[selectedLanguage] || ""
            : b[sortConfig.key];

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [questions, filterCategory, filterType, sortConfig, selectedLanguage]);

  // 삭제
  const handleDelete = async (q) => {
    if (!window.confirm(`${q.id} 문항을 삭제할까요?`)) return;

    try {
      await deleteDoc(doc(db, "questions", q.docId));
      setQuestions((prev) => prev.filter((x) => x.docId !== q.docId));
      toast.success("삭제 완료");
    } catch (err) {
      console.error(err);
      toast.error("삭제 실패");
    }
  };

  // 저장
  const handleSave = async () => {
    if (!editingQuestion) return;

    try {
      const { docId, ...payload } = editingQuestion;
      await updateDoc(doc(db, "questions", docId), payload);

      setQuestions((prev) =>
        prev.map((q) => (q.docId === docId ? editingQuestion : q))
      );

      toast.success("저장되었습니다!");
      setEditingQuestion(null);
    } catch (err) {
      console.error(err);
      toast.error("저장 실패");
    }
  };

  return (
    <div className="ap-root">
      <div className="ap-header">
        <h1>📋 Survey Admin Panel</h1>

        <div className="ap-filters">
          <div className="ap-filter-group">
            <label>Language</label>
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
            <label>Category</label>
            <input
              value={filterCategory}
              placeholder="category"
              onChange={(e) => setFilterCategory(e.target.value)}
            />
          </div>

          <div className="ap-filter-group">
            <label>Type</label>
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
      </div>

      {/* 질문 테이블 */}
      <div className="ap-table-wrapper">
        <table className="ap-table">
          <thead>
            <tr>
              <th onClick={() => onSort("id")}>ID ⬍</th>
              <th onClick={() => onSort("category")}>Category ⬍</th>
              <th onClick={() => onSort("type")}>Type ⬍</th>
              <th onClick={() => onSort("question")}>
                Question ({selectedLanguage}) ⬍
              </th>
              <th>Edit</th>
              <th>Del</th>
            </tr>
          </thead>

          <tbody>
            {filteredQuestions.map((q) => (
              <tr key={q.docId}>
                <td>{q.id}</td>
                <td>{q.category}</td>
                <td>{q.type}</td>
                <td>{q.text?.[selectedLanguage]}</td>
                <td>
                  <button className="ap-edit-btn" onClick={() => setEditingQuestion(q)}>
                    ✏️
                  </button>
                </td>
                <td>
                  <button className="ap-del-btn" onClick={() => handleDelete(q)}>
                    ❌
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ⭐ Modal Popup for Editing */}
      {editingQuestion && (
        <div className="ap-modal-overlay" onClick={() => setEditingQuestion(null)}>
          <div className="ap-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Question — {editingQuestion.id}</h2>

            <label>ID</label>
            <input
              value={editingQuestion.id}
              onChange={(e) =>
                setEditingQuestion({ ...editingQuestion, id: e.target.value })
              }
            />

            <label>Category</label>
            <input
              value={editingQuestion.category}
              onChange={(e) =>
                setEditingQuestion({ ...editingQuestion, category: e.target.value })
              }
            />

            <label>Type</label>
            <select
              value={editingQuestion.type}
              onChange={(e) =>
                setEditingQuestion({ ...editingQuestion, type: e.target.value })
              }
            >
              <option value="likert">Likert</option>
              <option value="text">Text</option>
              <option value="multi">Multi</option>
            </select>

            <label>Question ({selectedLanguage})</label>
            <textarea
              rows={4}
              value={editingQuestion.text?.[selectedLanguage] || ""}
              onChange={(e) =>
                setEditingQuestion({
                  ...editingQuestion,
                  text: {
                    ...(editingQuestion.text || {}),
                    [selectedLanguage]: e.target.value,
                  },
                })
              }
            />

            <div className="ap-modal-actions">
              <button className="ap-btn" onClick={() => setEditingQuestion(null)}>
                Cancel
              </button>
              <button className="ap-btn ap-btn-primary" onClick={handleSave}>
                💾 Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
