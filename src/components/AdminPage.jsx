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
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";
import toast from "react-hot-toast";
import Papa from "papaparse";
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
  const [uploading, setUploading] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("all");

  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editData, setEditData] = useState({});

  // 정렬 상태
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
      toast.success(`✅ ${list.length}개 질문 로드 완료`);
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

    // 정렬 처리
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
      toast.success("삭제 완료!");
    } catch (err) {
      console.error(err);
      toast.error("삭제 중 오류 발생");
    }
  };

  // 수정 모달 열기
  const handleEditClick = (q) => {
    setEditingQuestion(q);
    setEditData({
      id: q.id,
      category: q.category,
      type: q.type,
      question: q.text?.[selectedLanguage] || "",
      options: q.options || [],
    });
  };

  // 저장
  const handleSave = async () => {
    try {
      const updateData = {
        category: editData.category,
        type: editData.type,
        [`text.${selectedLanguage}`]: editData.question,
        updatedAt: serverTimestamp(),
      };

      // options가 있는 타입인 경우에만 options 업데이트
      if (editData.type === "multi" || editData.type === "likert") {
        updateData.options = editData.options;
      }

      await updateDoc(doc(db, "questions", editingQuestion.docId), updateData);

      toast.success("저장 완료!");
      setEditingQuestion(null);
      loadQuestions(); // 리스트 다시 로드
    } catch (err) {
      console.error("Save Error:", err);
      toast.error("저장 중 오류 발생");
    }
  };

  // 📤 CSV 업로드 처리
  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const data = results.data;

          if (data.length === 0) {
            toast.error("CSV 파일이 비어있습니다.");
            setUploading(false);
            return;
          }

          // CSV 데이터를 Firebase 형식으로 변환
          const batch = writeBatch(db);
          let successCount = 0;
          let errorCount = 0;

          for (const row of data) {
            try {
              // 필수 필드 체크
              if (!row.id || !row.category || !row.type) {
                console.warn("필수 필드 누락:", row);
                errorCount++;
                continue;
              }

              // 문서 ID는 row.id 그대로 사용 (Q100, Q101 형식)
              const docId = row.id;
              const docRef = doc(db, "questions", docId);

              // text 객체 생성
              const text = {};
              LANG_OPTIONS.forEach((lang) => {
                if (row[lang.value]) {
                  text[lang.value] = row[lang.value];
                }
              });

              // options 처리 (쉼표로 구분된 문자열 → 배열)
              let options = [];
              if (row.options && row.options.trim()) {
                options = row.options
                  .split(",")
                  .map((opt) => opt.trim())
                  .filter((opt) => opt.length > 0);
              }

              // Firestore 문서 데이터
              const questionData = {
                id: row.id, // "Q100" 형식 문자열
                category: row.category.trim(),
                type: row.type.trim(),
                text: text,
                options: options,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              };

              batch.set(docRef, questionData);
              successCount++;
            } catch (err) {
              console.error("행 처리 오류:", row, err);
              errorCount++;
            }
          }

          // Batch 실행
          if (successCount > 0) {
            await batch.commit();
            toast.success(
              `✅ ${successCount}개 업로드 완료! ${
                errorCount > 0 ? `(오류: ${errorCount}개)` : ""
              }`
            );
            loadQuestions(); // 새로고침
          } else {
            toast.error("업로드할 데이터가 없습니다.");
          }
        } catch (err) {
          console.error("CSV 업로드 오류:", err);
          toast.error("업로드 중 오류 발생");
        } finally {
          setUploading(false);
          event.target.value = ""; // 파일 입력 초기화
        }
      },
      error: (error) => {
        console.error("CSV 파싱 오류:", error);
        toast.error("CSV 파일 파싱 중 오류 발생");
        setUploading(false);
        event.target.value = "";
      },
    });
  };

  // 📥 CSV 템플릿 다운로드
  const downloadCSVTemplate = () => {
    const template = `id,category,type,en,ko,zh,kk,uz,bn,options
Q200,Technology,likert,I am satisfied with the technology infrastructure,나는 기술 인프라에 만족한다,我对技术基础设施感到满意,Мен технологиялық инфрақұрылымға қанағаттанамын,Men texnologik infratuzilmadan mamnunman,আমি প্রযুক্তি অবকাঠামোতে সন্তুষ্ট,"Strongly Agree,Agree,Neutral,Disagree,Strongly Disagree"
Q201,Teaching,text,What improvements would you suggest for our teaching methods?,우리의 교수법 개선을 위해 어떤 제안을 하시겠습니까?,您对我们的教学方法有什么改进建议?,Оқыту әдістерімізді жақсарту үшін қандай ұсыныстар жасар едіңіз?,O'qitish usullarimizni yaxshilash uchun qanday takliflar berasiz?,আমাদের শিক্ষণ পদ্ধতির উন্নতির জন্য আপনি কি সুপারিশ করবেন?,
Q202,Facilities,multi,Which facilities do you use most often?,어떤 시설을 가장 자주 이용하시나요?,您最常使用哪些设施?,Қандай мекемелерді жиі пайдаланасыз?,Qaysi ob'ektlardan eng ko'p foydalanasiz?,আপনি কোন সুবিধাগুলি সবচেয়ে বেশি ব্যবহার করেন?,"Library,Computer Lab,Sports Center,Cafeteria,Study Rooms"`;

    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "survey_template.csv";
    link.click();
    
    toast.success("템플릿 다운로드 완료!");
  };

  // 📥 현재 DB 전체 내보내기
  const exportAllQuestions = () => {
    if (questions.length === 0) {
      toast.error("내보낼 데이터가 없습니다.");
      return;
    }

    // CSV 헤더
    const headers = ["id", "category", "type", "en", "ko", "zh", "kk", "uz", "bn", "options"];

    // CSV 데이터
    const rows = questions.map((q) => {
      const optionsStr = q.options ? q.options.join(",") : "";
      return [
        q.id,
        q.category,
        q.type,
        q.text?.en || "",
        q.text?.ko || "",
        q.text?.zh || "",
        q.text?.kk || "",
        q.text?.uz || "",
        q.text?.bn || "",
        `"${optionsStr}"`,
      ];
    });

    // CSV 문자열 생성
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // 다운로드
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `questions_export_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    toast.success(`✅ ${questions.length}개 질문 내보내기 완료!`);
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

          <button className="ap-btn" onClick={loadQuestions} disabled={loading}>
            {loading ? "⏳ Loading..." : "🔄 Reload"}
          </button>

          {/* CSV 업로드 버튼 */}
          <div className="ap-filter-group">
            <label>CSV Upload</label>
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              disabled={uploading}
              style={{ display: "none" }}
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="ap-btn ap-upload-btn">
              {uploading ? "⏳ Uploading..." : "📤 Upload CSV"}
            </label>
          </div>

          {/* CSV 템플릿 다운로드 */}
          <button className="ap-btn" onClick={downloadCSVTemplate}>
            📥 Template
          </button>

          {/* 전체 내보내기 */}
          <button className="ap-btn" onClick={exportAllQuestions}>
            💾 Export All
          </button>
        </div>

        {/* 통계 */}
        <div className="ap-stats">
          <span>Total: {questions.length}</span>
          <span>|</span>
          <span>Filtered: {filteredQuestions.length}</span>
        </div>
      </div>

      {/* 질문 테이블 */}
      <div className="ap-table-wrapper">
        <table className="ap-table">
          <thead>
            <tr>
              <th onClick={() => onSort("id")} style={{ cursor: "pointer" }}>
                ID ⬍
              </th>
              <th onClick={() => onSort("category")} style={{ cursor: "pointer" }}>
                Category ⬍
              </th>
              <th onClick={() => onSort("type")} style={{ cursor: "pointer" }}>
                Type ⬍
              </th>
              <th onClick={() => onSort("question")} style={{ cursor: "pointer" }}>
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
                  <button
                    className="ap-edit-btn"
                    onClick={() => handleEditClick(q)}
                  >
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

      {/* 수정 모달 */}
      {editingQuestion && (
        <div className="ap-modal-overlay" onClick={() => setEditingQuestion(null)}>
          <div className="ap-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Question — {editingQuestion.id}</h2>

            {/* ID (수정 불가) */}
            <label>ID</label>
            <input type="text" value={editData.id} disabled />

            {/* Category */}
            <label>Category</label>
            <input
              type="text"
              value={editData.category}
              onChange={(e) =>
                setEditData({ ...editData, category: e.target.value })
              }
            />

            {/* Type */}
            <label>Type</label>
            <select
              value={editData.type}
              onChange={(e) =>
                setEditData({ ...editData, type: e.target.value })
              }
            >
              <option value="likert">Likert</option>
              <option value="text">Text</option>
              <option value="multi">Multi</option>
            </select>

            {/* Question Text */}
            <label>Question ({selectedLanguage})</label>
            <textarea
              rows="4"
              value={editData.question}
              onChange={(e) =>
                setEditData({ ...editData, question: e.target.value })
              }
            />

            {/* OPTIONS — multi 또는 likert일 때만 표시 */}
            {(editData.type === "multi" || editData.type === "likert") && (
              <>
                <label>
                  Options{" "}
                  <span style={{ fontSize: "12px", opacity: 0.7 }}>
                    (comma-separated)
                  </span>
                </label>
                <textarea
                  rows="3"
                  placeholder="예: Option A, Option B, Option C"
                  value={editData.options?.join(", ") || ""}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      options: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter((v) => v.length > 0),
                    })
                  }
                />
              </>
            )}

            {/* Buttons */}
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
