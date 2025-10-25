// src/layouts/DashboardLayout.jsx
import React, { useState } from "react";
import Sidebar from "../components/sidebar.jsx";
import Topbar from "../components/topbar.jsx";

const layoutStyles = {
  container: { display: "flex", height: "100vh", fontFamily: "Poppins, system-ui, sans-serif" },
  main: { flex: 1, display: "flex", flexDirection: "column", background: "#fff" },
  contentWrap: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center" },
};

export default function DashboardLayout({ children }) {
  const [active, setActive] = useState("Trang chủ");

  return (
    <div style={layoutStyles.container}>
      <Sidebar active={active} onSelect={(k) => setActive(k)} />
      <div style={layoutStyles.main}>
        <Topbar />
        <div style={layoutStyles.contentWrap}>
          {children}
        </div>
      </div>
    </div>
  );
}
