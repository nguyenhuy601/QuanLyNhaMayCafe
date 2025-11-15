import React from "react";
import SidebarXuongTruong from "../components/factory/Sidebar.jsx";
import Header from "../components/factory/Header.jsx";
import { Outlet } from "react-router-dom";
 // Nếu dùng React Router v6

export default function LayoutXuongTruong() {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: "#f8f3ee",
        overflow: "hidden",
      }}
    >
      {/* Sidebar bên trái */}
      <SidebarXuongTruong />

      {/* Khu vực nội dung */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          overflow: "hidden",
        }}
      >
        {/* Header nằm trên cùng */}
        <Header />

        {/* Nội dung trang */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 30px",
          }}
        >
          <Outlet /> {/* render các trang con */}
        </main>
      </div>
    </div>
  );
}
