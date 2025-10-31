import React from "react";
import { Bell, Settings, User, Search } from "lucide-react";

export default function Header() {
  return (
    <header
      style={{
        backgroundColor: "#7a4a1b",
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        color: "white",
        boxSizing: "border-box",
      }}
    >
      {/* Ô tìm kiếm */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#a97458",
          borderRadius: "8px",
          padding: "6px 12px",
          width: "300px",
        }}
      >
        <Search size={16} color="white" />
        <input
          type="text"
          placeholder="Tìm kiếm..."
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            color: "white",
            paddingLeft: "10px",
            width: "100%",
            fontSize: "14px",
          }}
        />
      </div>

      {/* Biểu tượng + Thông tin người dùng */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <Bell size={18} color="white" style={{ cursor: "pointer" }} />
        <Settings size={18} color="white" style={{ cursor: "pointer" }} />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#d1884f",
            borderRadius: "20px",
            padding: "6px 12px",
            minWidth: "160px",
          }}
        >
          <User size={20} color="white" />
          <div style={{ marginLeft: "8px", lineHeight: "1.2" }}>
            <p style={{ fontWeight: "bold", fontSize: "14px", margin: 0 }}>
              Your Name
            </p>
            <p style={{ fontSize: "12px", opacity: 0.9, margin: 0 }}>
              Xưởng trưởng
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
