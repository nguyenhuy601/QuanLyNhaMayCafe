// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NhapKhoThanhPham from "./pages/QuanLyKhoThanhPham/NhapKhoThanhPham";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<NhapKhoThanhPham />} />
      </Routes>
    </Router>
  );
}

export default App;
