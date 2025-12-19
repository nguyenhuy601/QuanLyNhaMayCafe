// File: ./features/warehouseProduct/layouts/WarehouseProductLayout.jsx
import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../components/sidebar.jsx";
import Header from "../components/header.jsx";

export default function WarehouseProductLayout() {
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState("home");
  const [currentRole, setCurrentRole] = useState("khotp"); // khotp hoặc khonvl
  const [orderCount, setOrderCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);

  // Xác định role từ localStorage
  useEffect(() => {
    const role = (localStorage.getItem("role") || "").toLowerCase();
    if (role === "khonvl") {
      setCurrentRole("khonvl");
    } else if (role === "warehouseproduct") {
      // Backward compatibility: warehouseproduct = khotp
      setCurrentRole("khotp");
    } else {
      setCurrentRole("khotp"); // mặc định là khotp
    }
  }, []);

  // Cập nhật activeMenu dựa trên location
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("thong-ke")) {
      setActiveMenu("ThongKe");
    } else if (path.includes("kiem-dinh-qc")) {
      setActiveMenu("KiemDinhQC");
    } else if (path.includes("xac-nhan-nhap-kho")) {
      setActiveMenu("XacNhanNhapKho");
    } else if (path.includes("nhap-kho") && currentRole === "khonvl") {
      // Chỉ set activeMenu cho khonvl, không cho khotp
      setActiveMenu("NhapKho");
    } else if (path.includes("xuat-kho")) {
      setActiveMenu("XuatKho");
    } else {
      setActiveMenu("home");
    }
  }, [location]);

  useEffect(() => {
    // Có thể fetch dữ liệu cho sidebar từ API
    setOrderCount(15);
    setApprovedCount(0);
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        orderCount={orderCount}
        approvedCount={approvedCount}
        role={currentRole}
      />
      <div className="flex-1 flex flex-col">
        <Header role={currentRole} />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
