import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import MainGame from "./screens/MainGame";
import AdminPage from "./components/AdminPage";
import "./App.css";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainGame />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}
