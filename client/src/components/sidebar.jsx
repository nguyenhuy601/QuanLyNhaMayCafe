import React from "react";
import {
  Home,
  ClipboardList,
  BarChart3,
  FileText,
  CheckCircle,
  LogOut,
  Coffee,
} from "lucide-react";
import { NavLink } from "react-router-dom";

export default function SidebarXuongTruong() {
  const menu = [
    { path: "/", label: "Trang chủ", icon: <Home size={18} /> },
    { path: "/phan-cong", label: "Phân công công việc", icon: <ClipboardList size={18} /> },
    { path: "/thong-ke", label: "Thống kê kết quả sản xuất", icon: <BarChart3 size={18} /> },
    { path: "/xem-ke-hoach", label: "Xem kế hoạch", icon: <FileText size={18} /> },
    { path: "/kiem-tra", label: "Kiểm tra thành phẩm", icon: <CheckCircle size={18} /> },
  ];

  return (
    <aside
      style={{
        width: "280px",
        backgroundColor: "#5a2e05",
        color: "white",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        padding: "15px 0",
      }}
    >
      {/* Logo + Tên App */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "0 20px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Coffee size={32} color="white" />
        <div>
          <h2 style={{ fontWeight: "bold", fontSize: "18px", margin: 0 }}>
            Coffee Company
          </h2>
          <p style={{ fontSize: "12px", opacity: 0.8, margin: 0 }}>
            Coffee App - Dashboard v1.0
          </p>
        </div>
      </div>

      {/* Danh mục menu */}
      <div style={{ display: "flex", flexDirection: "column", marginTop: "20px", gap: "4px" }}>
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 20px",
              borderRadius: "10px",
              margin: "2px 10px",
              textDecoration: "none",
              backgroundColor: isActive ? "#a97458" : "transparent",
              color: "white",
              fontWeight: isActive ? "bold" : "normal",
              transition: "0.2s ease",
            })}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Trạng thái hệ thống + Đăng xuất */}
      <div style={{ marginTop: "auto", padding: "20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#a97458",
            borderRadius: "10px",
            padding: "10px 15px",
            marginBottom: "12px",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: "10px",
              height: "10px",
              backgroundColor: "#00ff00",
              borderRadius: "50%",
              marginRight: "8px",
            }}
          ></span>
          <span style={{ fontSize: "14px" }}>Trạng thái hệ thống</span>
        </div>

        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            backgroundColor: "#8b3f2c",
            border: "none",
            color: "white",
            padding: "10px 15px",
            borderRadius: "10px",
            cursor: "pointer",
            width: "100%",
          }}
          onClick={() => alert("Đăng xuất thành công!")}
        >
          <LogOut size={18} /> Đăng xuất
        </button>
      </div>
    </aside>
  );
}
