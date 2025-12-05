import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../components/sidebar.jsx";
import Header from "../components/header.jsx";

export default function WarehouseRawMaterialLayout() {
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState("home");
  const [planCount, setPlanCount] = useState(0);

  // Cập nhật activeMenu dựa trên location
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("thong-so-kho")) {
      setActiveMenu("ThongSoKho");
    } else if (path.includes("thong-ke")) {
      setActiveMenu("ThongKe");
    } else if (path.includes("nhap-kho")) {
      setActiveMenu("NhapKho");
    } else if (path.includes("xuat-kho")) {
      setActiveMenu("XuatKho");
    } else if (path.includes("ke-hoach")) {
      setActiveMenu("KeHoach");
    } else {
      setActiveMenu("home");
    }
  }, [location]);

  useEffect(() => {
    // Có thể fetch số lượng kế hoạch đã duyệt từ API
    setPlanCount(0);
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        planCount={planCount}
      />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

