import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import Header from "../components/Header.jsx";

export default function XuongTruong() {
  const location = useLocation();

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "230px",
          backgroundColor: "#4b2c14",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ padding: "20px", borderBottom: "1px solid #704220" }}>
            <h2 style={{ margin: "0", fontSize: "18px" }}>Coffee Company</h2>
            <p style={{ marginTop: "5px", fontSize: "12px" }}>
              Coffee App - Dashboard v1.0
            </p>
          </div>

          <nav style={{ marginTop: "10px" }}>
            <Link
              to="/dashboard"
              style={{
                display: "block",
                padding: "10px 20px",
                textDecoration: "none",
                color: "white",
                backgroundColor:
                  location.pathname === "/dashboard" ? "#a97458" : "transparent",
              }}
            >
              Trang chủ
            </Link>

            <Link
              to="/dashboard/phancong"
              style={{
                display: "block",
                padding: "10px 20px",
                textDecoration: "none",
                color: "white",
                backgroundColor:
                  location.pathname === "/dashboard/phancong" ? "#a97458" : "transparent",
              }}
            >
              Phân công công việc
            </Link>

            <Link
              to="#"
              style={{
                display: "block",
                padding: "10px 20px",
                textDecoration: "none",
                color: "white",
              }}
            >
              Thống kê sản xuất
            </Link>
          </nav>
        </div>

        <div
          style={{
            backgroundColor: "#704220",
            padding: "10px 20px",
            fontSize: "13px",
            borderTop: "1px solid #5b371d",
          }}
        >
          🟢 Trạng thái hệ thống
        </div>
      </aside>

      {/* Nội dung */}
      <main style={{ flex: 1, backgroundColor: "#fffaf5", overflowY: "auto" }}>
        <Header />
        <div style={{ padding: "20px" }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
