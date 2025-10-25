// src/components/Topbar.jsx
import React from "react";

const styles = {
  header: {
    height: 72,
    background: "linear-gradient(90deg,#7b3f22,#5d2f18)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 18px",
    boxSizing: "border-box",
  },
  search: {
    width: 520,
    maxWidth: "60%",
    padding: 10,
    borderRadius: 6,
    border: "2px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    color: "#fff",
  },
  right: { display: "flex", alignItems: "center", gap: 14 },
  iconBtn: { background: "transparent", border: "none", color: "#fff", fontSize: 18, cursor: "pointer" },
  profile: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    borderLeft: "1px solid rgba(255,255,255,0.08)",
    paddingLeft: 12,
  },
  avatar: { width: 46, height: 46, borderRadius: "50%", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" },
};

export default function Topbar() {
  return (
    <header style={styles.header}>
      <input style={styles.search} placeholder="Tìm kiếm..." />
      <div style={styles.right}>
        <button style={styles.iconBtn} title="Thông báo">🔔</button>
        <button style={styles.iconBtn} title="Cài đặt">⚙️</button>
        <div style={styles.profile}>
          <div style={styles.avatar}>👤</div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontWeight: 700 }}>Your Name</div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>Xưởng trưởng</div>
          </div>
        </div>
      </div>
    </header>
  );
}
