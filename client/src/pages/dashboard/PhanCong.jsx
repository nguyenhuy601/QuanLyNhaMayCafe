import React, { useState } from "react";

export default function PhanCong() {
  const [tab, setTab] = useState("danh-sach");
  const [showPopup, setShowPopup] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 2000);
  };

  const data = [
    { maTo: "A001", tenTo: "Tổ 1", congViec: "Rang cà phê", nguoi: "Xưởng trưởng A", ngay: "01/05/2025", maKH: "DH001" },
    { maTo: "A002", tenTo: "Tổ 2", congViec: "Xay cà phê", nguoi: "Xưởng trưởng A", ngay: "05/06/2025", maKH: "DH010" },
    { maTo: "A003", tenTo: "Tổ 3", congViec: "Đóng gói", nguoi: "Xưởng trưởng A", ngay: "10/05/2025", maKH: "DH011" },
  ];

  return (
    <div style={{ padding: "20px" }}>
      {/* --- Nút chuyển tab --- */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={() => setTab("danh-sach")}
          style={{
            background: tab === "danh-sach" ? "#8b5a2b" : "#c9a383",
            color: "white",
            padding: "8px 20px",
            borderRadius: "8px",
            border: "none",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Danh sách công việc
        </button>
        <button
          onClick={() => setTab("tao")}
          style={{
            background: tab === "tao" ? "#8b5a2b" : "#c9a383",
            color: "white",
            padding: "8px 20px",
            borderRadius: "8px",
            border: "none",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Phân công
        </button>
      </div>

      {/* --- Trang Danh sách công việc --- */}
      {tab === "danh-sach" && (
        <div>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              color: "#4b2e18",
            }}
          >
            <thead>
              <tr style={{ background: "#8b5a2b", color: "white" }}>
                <th>Mã tổ</th>
                <th>Tên tổ</th>
                <th>Tên công việc</th>
                <th>Người phân công</th>
                <th>Ngày phân công</th>
                <th>Mã kế hoạch</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.maTo} style={{ borderBottom: "1px solid #ccc", textAlign: "center" }}>
                  <td>{row.maTo}</td>
                  <td>{row.tenTo}</td>
                  <td>{row.congViec}</td>
                  <td>{row.nguoi}</td>
                  <td>{row.ngay}</td>
                  <td>{row.maKH}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- Trang Tạo phân công --- */}
      {tab === "tao" && (
        <div style={{ marginTop: "20px" }}>
          <form
            onSubmit={handleSubmit}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              background: "#fff",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            }}
          >
            <div>
              <label>Mã tổ</label>
              <select className="input" style={selectStyle}>
                <option>A001</option>
                <option>A002</option>
                <option>A003</option>
              </select>
            </div>

            <div>
              <label>Ngày phân công</label>
              <input type="date" className="input" style={inputStyle} />
            </div>

            <div>
              <label>Tên tổ</label>
              <select className="input" style={selectStyle}>
                <option>Tổ 1</option>
                <option>Tổ 2</option>
                <option>Tổ 3</option>
              </select>
            </div>

            <div>
              <label>Mã kế hoạch</label>
              <select className="input" style={selectStyle}>
                <option>DH001</option>
                <option>DH010</option>
                <option>DH011</option>
              </select>
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label>Tên công việc</label>
              <input type="text" placeholder="Nhập công việc" style={inputStyle} />
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label>Người phân công</label>
              <input type="text" placeholder="Nhập chức vụ người phân công" style={inputStyle} />
            </div>

            <div style={{ gridColumn: "span 2", textAlign: "center" }}>
              <button
                type="submit"
                style={{
                  background: "#8b5a2b",
                  color: "white",
                  padding: "10px 40px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Lưu
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- Popup tạo thành công --- */}
      {showPopup && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "black",
              color: "white",
              padding: "15px 30px",
              borderRadius: "30px",
              fontWeight: "bold",
            }}
          >
            Tạo bảng phân công thành công
          </div>
        </div>
      )}
    </div>
  );
}

// --- CSS nội tuyến chung ---
const inputStyle = {
  width: "100%",
  padding: "8px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  marginTop: "5px",
};

const selectStyle = {
  ...inputStyle,
  backgroundColor: "white",
};
