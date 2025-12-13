import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/config";
import toast from "react-hot-toast";
import "./AdminPage.css";

const AdminPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState("all");

  // 편집 모달
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // 폼 데이터
  const [formData, setFormData] = useState({
    id: "",
    category: "",
    type: "likert",
    text: { en: "", ko: "", zh: "", kk: "", uz: "", bn: "" },
    options: [], // 배열로 저장
  });

  // Options 입력용 (쉼표로 구분된 문자열)
  const [optionsInput, setOptionsInput] = useState("");

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "questions"), orderBy("id"));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((doc) => ({
        docId: doc.id,
        ...doc.data(),
      }));
      setQuestions(list);
    } catch (err) {
      toast.error("Failed to load questions");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 편집 모달 열기
  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      id: question.id || "",
      category: question.category || "",
      type: question.type || "likert",
      text: question.text || { en: "", ko: "", zh: "", kk: "", uz: "", bn: "" },
      options: question.options || [],
    });

    // Options를 쉼표로 구분된 문자열로 변환
    if (question.options && Array.isArray(question.options)) {
      setOptionsInput(question.options.join(", "));
    } else if (question.options && typeof question.options === 'string') {
      // 혹시 문자열로 저장되어 있다면
      setOptionsInput(question.options);
    } else {
      setOptionsInput("");
    }

    setIsModalOpen(true);
  };

  // 새 질문 추가 모달 열기
  const handleAddNew = () => {
    setEditingQuestion(null);
    setFormData({
      id: "",
      category: "",
      type: "likert",
      text: { en: "", ko: "", zh: "", kk: "", uz: "", bn: "" },
      options: [],
    });
    setOptionsInput("");
    setIsModalOpen(true);
  };

  // 저장
  const handleSave = async () => {
    try {
      // Options 파싱 (쉼표 또는 파이프로 구분)
      let parsedOptions = [];
      if (formData.type === "multi" && optionsInput.trim()) {
        const delimiter = optionsInput.includes("|") ? "|" : ",";
        parsedOptions = optionsInput
          .split(delimiter)
          .map((opt) => opt.trim())
          .filter((opt) => opt.length > 0);
      }

      const dataToSave = {
        ...formData,
        options: formData.type === "multi" ? parsedOptions : [],
        updatedAt: new Date(),
      };

      if (editingQuestion) {
        // 수정
        await updateDoc(doc(db, "questions", editingQuestion.docId), dataToSave);
        toast.success("Question updated!");
      } else {
        // 새로 추가
        await addDoc(collection(db, "questions"), {
          ...dataToSave,
          createdAt: new Date(),
        });
        toast.success("Question added!");
      }

      setIsModalOpen(false);
      loadQuestions();
    } catch (err) {
      toast.error("Failed to save");
      console.error(err);
    }
  };

  // 삭제
  const handleDelete = async (docId) => {
    if (!window.confirm("Delete this question?")) return;

    try {
      await deleteDoc(doc(db, "questions", docId));
      toast.success("Question deleted!");
      loadQuestions();
    } catch (err) {
      toast.error("Failed to delete");
      console.error(err);
    }
  };

  // CSV 업로드
  const handleCSVUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const rows = text.split("\n").map((row) => row.trim()).filter(Boolean);
      
      if (rows.length < 2) {
        toast.error("CSV file is empty or invalid");
        return;
      }

      const headers = rows[0].split(",").map((h) => h.trim());
      
      const idIndex = headers.indexOf("id");
      const categoryIndex = headers.indexOf("category");
      const typeIndex = headers.indexOf("type");
      const enIndex = headers.indexOf("en");
      const koIndex = headers.indexOf("ko");
      const zhIndex = headers.indexOf("zh");
      const kkIndex = headers.indexOf("kk");
      const uzIndex = headers.indexOf("uz");
      const bnIndex = headers.indexOf("bn");
      const optionsIndex = headers.indexOf("options");

      let uploadedCount = 0;

      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i].split(",").map((c) => c.trim());

        const id = cols[idIndex] || `Q${i}`;
        const category = cols[categoryIndex] || "General";
        const type = cols[typeIndex] || "likert";

        const text = {
          en: cols[enIndex] || "",
          ko: cols[koIndex] || "",
          zh: cols[zhIndex] || "",
          kk: cols[kkIndex] || "",
          uz: cols[uzIndex] || "",
          bn: cols[bnIndex] || "",
        };

        // Options 처리
        let options = [];
        if (type === "multi" && optionsIndex >= 0 && cols[optionsIndex]) {
          const optionsStr = cols[optionsIndex].trim();
          if (optionsStr.includes(",")) {
            options = optionsStr.split(",").map((opt) => opt.trim()).filter((opt) => opt.length > 0);
          } else if (optionsStr.includes("|")) {
            options = optionsStr.split("|").map((opt) => opt.trim()).filter((opt) => opt.length > 0);
          } else {
            options = [optionsStr];
          }
        }

        await addDoc(collection(db, "questions"), {
          id,
          category,
          type,
          text,
          options: type === "multi" ? options : [],
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        uploadedCount++;
      }

      toast.success(`${uploadedCount} questions uploaded!`);
      loadQuestions();
    } catch (err) {
      toast.error("CSV upload failed");
      console.error(err);
    }
  };

  // CSV 템플릿 다운로드
  const handleDownloadTemplate = () => {
    const template = `id,category,type,en,ko,zh,kk,uz,bn,options
Q1,Personal Background,multi,Status,신분,身份,Мәртебесі,Holati,Status,"Regular,Transfer,Exchange"
Q2,Personal Background,likert,Satisfaction,만족도,满意度,Қанағаттану,Qoniqish,সন্তুষ্টি,
Q3,Academic,text,Feedback,피드백,反馈,Кері байланыс,Fikr-mulohaza,মতামত,`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "survey_template.csv";
    a.click();
  };

  // CSV 내보내기
  const handleExportAll = async () => {
    try {
      const headers = "id,category,type,en,ko,zh,kk,uz,bn,options\n";
      
      const rows = questions.map((q) => {
        const optionsStr = q.options && Array.isArray(q.options) 
          ? q.options.join(",") 
          : "";
        
        return `${q.id},${q.category},${q.type},${q.text?.en || ""},${q.text?.ko || ""},${q.text?.zh || ""},${q.text?.kk || ""},${q.text?.uz || ""},${q.text?.bn || ""},"${optionsStr}"`;
      });

      const csv = headers + rows.join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `survey_questions_${Date.now()}.csv`;
      a.click();

      toast.success("CSV exported!");
    } catch (err) {
      toast.error("Export failed");
      console.error(err);
    }
  };

  // 필터링
  const filteredQuestions = questions.filter((q) => {
    if (filterType === "all") return true;
    return q.type === filterType;
  });

  return (
    <div className="admin-container">
      <h1 className="admin-title">📊 Admin Panel</h1>

      {/* 상단 버튼들 */}
      <div className="admin-controls">
        <div className="filter-group">
          <label>Type</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All</option>
            <option value="multi">Multi</option>
            <option value="likert">Likert</option>
            <option value="text">Text</option>
          </select>
        </div>

        <div className="csv-upload-section">
          <span className="section-label">CSV Upload</span>
          <button className="btn-reload" onClick={loadQuestions}>
            🔄 Reload
          </button>
          <label className="btn-upload">
            📤 Upload CSV
            <input type="file" accept=".csv" onChange={handleCSVUpload} style={{ display: "none" }} />
          </label>
          <button className="btn-template" onClick={handleDownloadTemplate}>
            📋 Template
          </button>
          <button className="btn-export" onClick={handleExportAll}>
            💾 Export All
          </button>
        </div>

        <button className="btn-add-new" onClick={handleAddNew}>
          ➕ Add New Question
        </button>
      </div>

      {/* 질문 목록 테이블 */}
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <table className="question-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Category</th>
              <th>Type</th>
              <th>Question (en)</th>
              <th>Options</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuestions.map((q) => (
              <tr key={q.docId}>
                <td>{q.id}</td>
                <td>{q.category}</td>
                <td className={`type-badge type-${q.type}`}>{q.type}</td>
                <td>{q.text?.en || "—"}</td>
                <td>
                  {q.options && Array.isArray(q.options) && q.options.length > 0 ? (
                    <span className="options-preview">{q.options.join(", ")}</span>
                  ) : (
                    <span className="no-options">—</span>
                  )}
                </td>
                <td>
                  <button className="btn-edit" onClick={() => handleEdit(q)}>
                    ✏️ Edit
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(q.docId)}>
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 편집 모달 */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingQuestion ? `Edit Question — ${formData.id}` : "Add New Question"}</h2>

            <div className="form-group">
              <label>ID</label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                placeholder="Q1, Q2, Q3..."
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Personal Background, Academic..."
              />
            </div>

            <div className="form-group">
              <label>Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="likert">Likert</option>
                <option value="multi">Multi</option>
                <option value="text">Text</option>
              </select>
            </div>

            {/* Multi 타입일 때만 Options 표시 */}
            {formData.type === "multi" && (
              <div className="form-group options-group">
                <label>Options (선택지)</label>
                <input
                  type="text"
                  value={optionsInput}
                  onChange={(e) => setOptionsInput(e.target.value)}
                  placeholder="Regular, Transfer, Exchange (쉼표로 구분)"
                  className="options-input"
                />
                <small className="input-hint">
                  💡 쉼표(,) 또는 파이프(|)로 구분하세요. 예: "Regular, Transfer, Exchange"
                </small>
                {optionsInput && (
                  <div className="options-preview-box">
                    <strong>미리보기:</strong>
                    <div className="preview-options">
                      {optionsInput
                        .split(/[,|]/)
                        .map((opt, idx) => opt.trim())
                        .filter(Boolean)
                        .map((opt, idx) => (
                          <span key={idx} className="preview-option-badge">
                            {idx + 1}. {opt}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="form-group">
              <label>Question (en)</label>
              <textarea
                value={formData.text.en}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    text: { ...formData.text, en: e.target.value },
                  })
                }
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Question (ko)</label>
              <textarea
                value={formData.text.ko}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    text: { ...formData.text, ko: e.target.value },
                  })
                }
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Question (zh)</label>
              <textarea
                value={formData.text.zh}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    text: { ...formData.text, zh: e.target.value },
                  })
                }
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Question (kk)</label>
              <textarea
                value={formData.text.kk}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    text: { ...formData.text, kk: e.target.value },
                  })
                }
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Question (uz)</label>
              <textarea
                value={formData.text.uz}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    text: { ...formData.text, uz: e.target.value },
                  })
                }
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Question (bn)</label>
              <textarea
                value={formData.text.bn}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    text: { ...formData.text, bn: e.target.value },
                  })
                }
                rows={3}
              />
            </div>

            <div className="modal-buttons">
              <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleSave}>
                💾 Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;