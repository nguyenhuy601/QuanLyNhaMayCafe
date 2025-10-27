import React from "react";
import { Home, ClipboardList, BarChart3, CheckCircle, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function SidebarXuongTruong() {
  const menu = [
    { path: "/", label: "Trang chủ", icon: <Home size={18} /> },
    { path: "/phan-cong", label: "Phân công công việc", icon: <ClipboardList size={18} /> },
    { path: "/thong-ke", label: "Thống kê kết quả sản xuất", icon: <BarChart3 size={18} /> },
    { path: "/kiem-tra", label: "Kiểm tra thành phẩm", icon: <CheckCircle size={18} /> },
  ];

  return (
    <aside
      style={{
        width: "230px",
        backgroundColor: "#4b2e05",
        color: "white",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        padding: "20px 10px",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "25px" }}>
        <h2 style={{ fontWeight: "bold", fontSize: "20px" }}>Coffee Company</h2>
        <p style={{ fontSize: "13px", opacity: 0.8 }}>Coffee App - Dashboard v1.0</p>
      </div>

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

      <div style={{ marginTop: "auto", paddingTop: "20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#835230",
            borderRadius: "8px",
            padding: "8px 10px",
            marginBottom: "10px",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: "10px",
              height: "10px",
              backgroundColor: "limegreen",
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
            backgroundColor: "#a14b31",
            border: "none",
            color: "white",
            padding: "10px 15px",
            borderRadius: "8px",
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
