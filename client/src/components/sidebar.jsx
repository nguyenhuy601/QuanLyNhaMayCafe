import React from "react";
import {
  Home,
  ClipboardList,
  BarChart3,
  FileText,
  LogOut,
} from "lucide-react";
import { NavLink } from "react-router-dom";

export default function SidebarXuongTruong() {
  const menu = [
    { path: "/", label: "Trang chủ", icon: <Home size={18} /> },
    { path: "/phan-cong", label: "Phân công công việc", icon: <ClipboardList size={18} /> },
    { path: "/thong-ke", label: "Thống kê kết quả sản xuất", icon: <BarChart3 size={18} /> },
    { path: "/xem-ke-hoach", label: "Xem kế hoạch", icon: <FileText size={18} /> },
  ];

  return (
    <aside
      style={{
        width: "230px",
        background: "linear-gradient(to bottom, #92400e, #78350f)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        padding: "20px 10px",
        boxShadow: "2px 0 6px rgba(0,0,0,0.15)",
      }}
    >
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: "25px" }}>
        <h2 style={{ fontWeight: "bold", fontSize: "20px", color: "#fde68a" }}>
          Coffee Company
        </h2>
        <p style={{ fontSize: "13px", color: "#fbbf24" }}>
          Dashboard Quản Lý Sản Xuất
        </p>
      </div>

      {/* Menu */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 15px",
              borderRadius: "8px",
              textDecoration: "none",
              backgroundColor: isActive ? "#b45309" : "transparent",
              color: isActive ? "#fff" : "#fde68a",
              fontWeight: isActive ? "bold" : "normal",
              transition: "0.2s ease",
            })}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Footer */}
      <div style={{ marginTop: "auto", paddingTop: "20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#b45309",
            borderRadius: "8px",
            padding: "8px 10px",
            marginBottom: "10px",
            color: "#fde68a",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: "10px",
              height: "10px",
              backgroundColor: "#fcd34d",
              borderRadius: "50%",
              marginRight: "8px",
            }}
          ></span>
          <span>Trạng thái hệ thống</span>
        </div>

        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            backgroundColor: "#92400e",
            border: "none",
            color: "white",
            padding: "10px 15px",
            borderRadius: "8px",
            cursor: "pointer",
            width: "100%",
            transition: "0.2s ease",
          }}
          onClick={() => alert("Đăng xuất thành công!")}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#b45309")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#92400e")
          }
        >
          <LogOut size={18} /> Đăng xuất
        </button>
      </div>
    </aside>
  );
}
