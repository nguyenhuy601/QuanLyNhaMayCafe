import React from "react";
import { Routes, Route } from "react-router-dom";
import LayoutXuongTruong from "./layouts/XuongTruong.jsx";
import TrangChu from "./pages/dashboard/Dashboard.jsx";
import PhanCong from "./pages/dashboard/PhanCong.jsx";
import ThongKe from "./pages/dashboard/ThongKe.jsx";
import XemKeHoach from "./pages/dashboard/XemKeHoach.jsx";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LayoutXuongTruong />}>
        <Route index element={<TrangChu />} />
        <Route path="phan-cong" element={<PhanCong />} />
        <Route path="thong-ke" element={<ThongKe />} />
        <Route path="xem-ke-hoach" element={<XemKeHoach />} />
        <Route path="thong-ke" element={<ThongKe />} />
      </Route>
    </Routes>
  );
}
