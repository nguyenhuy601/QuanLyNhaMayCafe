import React from "react";

export default function Header() {
  return (
    <header
      style={{
        backgroundColor: "#8b5a2b",
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
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: "14px" }}>🔍</span>
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
        <span style={{ fontSize: "18px", cursor: "pointer" }}>🔔</span>
        <span style={{ fontSize: "18px", cursor: "pointer" }}>⚙️</span>

        {/* Thông tin người dùng */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#d1884f",
            borderRadius: "12px",
            padding: "6px 12px",
            minWidth: "150px",
            justifyContent: "flex-start",
          }}
        >
          <span style={{ fontSize: "20px" }}>👤</span>
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
