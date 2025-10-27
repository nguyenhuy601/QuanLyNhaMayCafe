import { Routes, Route, Navigate } from "react-router-dom";
import XuongTruong from "./layouts/XuongTruong.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import PhanCong from "./pages/dashboard/PhanCong.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/dashboard" element={<XuongTruong />}>
        <Route index element={<Dashboard />} />
        <Route path="phancong" element={<PhanCong />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
