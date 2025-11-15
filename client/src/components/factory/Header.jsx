import React from "react";
import { Search, Bell, Settings, User } from "lucide-react";

export default function Header() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <header
      style={{
        background: "linear-gradient(to right, #92400e, #78350f)", // từ amber-700 sang amber-800
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        color: "white",
        boxSizing: "border-box",
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
      }}
    >
      {/* Ô tìm kiếm */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#b45309", // amber-700
          borderRadius: "8px",
          padding: "6px 12px",
          width: "300px",
          flexShrink: 0,
        }}
      >
        <Search size={16} style={{ color: "white" }} />
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

      {/* Icon + User Info */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          flexShrink: 0,
        }}
      >
        <Bell size={20} style={{ cursor: "pointer", color: "white" }} />
        <Settings size={20} style={{ cursor: "pointer", color: "white" }} />

        {/* Thông tin người dùng */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#b45309", // amber-700
            borderRadius: "12px",
            padding: "6px 12px",
            minWidth: "150px",
            justifyContent: "flex-start",
            color: "white",
          }}
        >
          <User size={20} />
          <div style={{ marginLeft: "8px", lineHeight: "1.2" }}>
            <p style={{ fontWeight: "bold", fontSize: "14px", margin: 0 }}>
              {user.hoTen || "Your Name"}
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
