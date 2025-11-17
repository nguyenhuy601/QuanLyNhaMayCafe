import React, { useState } from "react";
import Sidebar from "../components/kiemDinh/Sidebar";
import Header from "../components/kiemDinh/Header";
import { Outlet } from "react-router-dom";

const QCLayout = () => {
  // ✅ Thêm state để lưu menu đang active
  const [activeMenu, setActiveMenu] = useState("home");

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Truyền activeMenu và setActiveMenu xuống Sidebar */}
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      <div className="ml-64 flex-1 flex flex-col h-screen">
        <Header />
        <main className="flex-1 p-6 bg-[#f8f5f1] overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default QCLayout;
