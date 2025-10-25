import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/sidebar.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import PhanCong from "./pages//dashboard/PhanCong.jsx";

function App() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar cố định bên trái */}
      <Sidebar />

      {/* Khu vực hiển thị nội dung chính */}
      <div className="flex-1 p-6 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/phancong" element={<PhanCong />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
