import React, { useEffect, useState } from "react";
import { db } from "../firebase/config";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import "./AdminPage.css";

const LANGUAGES = ["en", "ko", "zh", "uz", "kk", "bn"];

export default function AdminPage() {
  const [questions, setQuestions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedLang, setSelectedLang] = useState("en");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");

  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  // -----------------------
  // 🔥 Load all questions
  // -----------------------
  const loadQuestions = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "questions"));
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    setQuestions(data);
    setFiltered(data);
    setLoading(false);
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  // -----------------------
  // 🔍 Filter logic
  // -----------------------
  useEffect(() => {
    let list = [...questions];

    if (category) list = list.filter(q => q.category === category);
    if (type) list = list.filter(q => q.type === type);

    setFiltered(list);
  }, [category, type, questions]);

  // -----------------------
  // ✏️ Edit a question
  // -----------------------
  const startEdit = (q) => {
    setEditing(JSON.parse(JSON.stringify(q))); // deep copy
  };

  // -----------------------
  // 💾 Save to Firestore
  // -----------------------
  const saveEdit = async () => {
    if (!editing) return;

    const ref = doc(db, "questions", editing.id);
    await updateDoc(ref, editing);

    alert("Updated successfully!");
    setEditing(null);
    loadQuestions();
  };

  // -----------------------
  // 🗑 Delete Question
  // -----------------------
  const deleteQuestion = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;

    await deleteDoc(doc(db, "questions", id));
    loadQuestions();
  };

  return (
    <div className="admin-container">
      <h1>📊 Survey Admin Panel</h1>

      {/* ---------------- LANGUAGE SELECT ---------------- */}
      <div className="filters">
        <label>Language:</label>
        <select value={selectedLang} onChange={(e) => setSelectedLang(e.target.value)}>
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>{l.toUpperCase()}</option>
          ))}
        </select>

        <label>Category:</label>
        <input
          placeholder="e.g. Personal Background"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <label>Type:</label>
        <input
          placeholder="likert / text / multi"
          value={type}
          onChange={(e) => setType(e.target.value)}
        />
      </div>

      {loading && <p>Loading...</p>}

      {/* ---------------- EDIT PANEL ---------------- */}
      {editing && (
        <div className="edit-box">
          <h2>✏️ Edit Question</h2>

          <label>ID</label>
          <input value={editing.id} disabled />

          <label>Category</label>
          <input
            value={editing.category}
            onChange={(e) => setEditing({ ...editing, category: e.target.value })}
          />

          <label>Type</label>
          <input
            value={editing.type}
            onChange={(e) => setEditing({ ...editing, type: e.target.value })}
          />

          {/* Text per language */}
          {LANGUAGES.map((l) => (
            <div key={l}>
              <label>{l.toUpperCase()}</label>
              <input
                value={editing.text?.[l] || ""}
                onChange={(e) => {
                  setEditing({
                    ...editing,
                    text: { ...editing.text, [l]: e.target.value },
                  });
                }}
              />
            </div>
          ))}

          {/* OPTIONS */}
          {editing.options && (
            <>
              <label>Options (comma separated)</label>
              <input
                value={editing.options.join(", ")}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    options: e.target.value.split(",").map(s => s.trim()),
                  })
                }
              />
            </>
          )}

          <button className="save-btn" onClick={saveEdit}>Save</button>
          <button className="cancel-btn" onClick={() => setEditing(null)}>Cancel</button>
        </div>
      )}

      {/* ---------------- LIST TABLE ---------------- */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Category</th>
            <th>Type</th>
            <th>Question ({selectedLang})</th>
            <th>Edit</th>
            <th>Del</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((q) => (
            <tr key={q.id}>
              <td>{q.id}</td>
              <td>{q.category}</td>
              <td>{q.type}</td>
              <td>{q.text?.[selectedLang]}</td>
              <td>
                <button onClick={() => startEdit(q)}>✏️</button>
              </td>
              <td>
                <button className="del" onClick={() => deleteQuestion(q.id)}>❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
