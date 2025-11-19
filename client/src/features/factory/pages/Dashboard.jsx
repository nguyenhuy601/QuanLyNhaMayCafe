import React from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate(); // Dùng để điều hướng trang

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1 style={{ fontWeight: "bold", marginBottom: "40px" }}>
        CHÀO MỪNG BẠN ĐÃ QUAY TRỞ LẠI
      </h1>
    </div>
  );
}
