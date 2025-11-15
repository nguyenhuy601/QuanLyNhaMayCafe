import React, { useState } from "react";

export default function PhanCong() {
  const [tab, setTab] = useState("danh-sach");
  const [showPopup, setShowPopup] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    maTo: "",
    ngay: "",
    tenTo: "",
    maKH: "",
    congViec: "",
    nguoi: "",
  });

  // ✅ Dùng state để lưu danh sách công việc
  const [jobs, setJobs] = useState([
    { maTo: "A001", tenTo: "Tổ 1", congViec: "Rang cà phê", nguoi: "Xưởng trưởng A", ngay: "2025-05-01", maKH: "DH001" },
    { maTo: "A002", tenTo: "Tổ 2", congViec: "Xay cà phê", nguoi: "Xưởng trưởng A", ngay: "2025-06-05", maKH: "DH010" },
    { maTo: "A003", tenTo: "Tổ 3", congViec: "Đóng gói", nguoi: "Xưởng trưởng A", ngay: "2025-05-10", maKH: "DH011" },
  ]);

  // --- Hàm xử lý thay đổi ---
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // --- Hàm submit ---
  const handleSubmit = (e) => {
    e.preventDefault();

    const { maTo, ngay, tenTo, maKH, congViec, nguoi } = formData;
    if (!maTo || !ngay || !tenTo || !maKH || !congViec || !nguoi) {
      setError("⚠️ Vui lòng nhập đầy đủ tất cả thông tin trước khi lưu!");
      return;
    }

    setError("");

    // ✅ Thêm dữ liệu mới vào danh sách
    const newJob = { ...formData };
    setJobs([...jobs, newJob]);

    // Hiện popup và reset form
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
      setTab("danh-sach"); // ✅ Tự chuyển sang tab danh sách
    }, 1500);

    setFormData({
      maTo: "",
      ngay: "",
      tenTo: "",
      maKH: "",
      congViec: "",
      nguoi: "",
    });
  };

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
              {jobs.map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #ccc", textAlign: "center" }}>
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
              <select name="maTo" value={formData.maTo} onChange={handleChange} style={selectStyle}>
                <option value="">-- Chọn mã tổ --</option>
                <option value="A001">A001</option>
                <option value="A002">A002</option>
                <option value="A003">A003</option>
              </select>
            </div>

            <div>
              <label>Ngày phân công</label>
              <input type="date" name="ngay" value={formData.ngay} onChange={handleChange} style={inputStyle} />
            </div>

            <div>
              <label>Tên tổ</label>
              <select name="tenTo" value={formData.tenTo} onChange={handleChange} style={selectStyle}>
                <option value="">-- Chọn tổ --</option>
                <option value="Tổ 1">Tổ 1</option>
                <option value="Tổ 2">Tổ 2</option>
                <option value="Tổ 3">Tổ 3</option>
              </select>
            </div>

            <div>
              <label>Mã kế hoạch</label>
              <select name="maKH" value={formData.maKH} onChange={handleChange} style={selectStyle}>
                <option value="">-- Chọn mã kế hoạch --</option>
                <option value="DH001">DH001</option>
                <option value="DH010">DH010</option>
                <option value="DH011">DH011</option>
              </select>
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label>Tên công việc</label>
              <input
                type="text"
                name="congViec"
                placeholder="Nhập công việc"
                value={formData.congViec}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label>Người phân công</label>
              <input
                type="text"
                name="nguoi"
                placeholder="Nhập tên người phân công"
                value={formData.nguoi}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            {error && (
              <div style={{ gridColumn: "span 2", color: "red", textAlign: "center", fontWeight: "bold" }}>
                {error}
              </div>
            )}

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
            ✅ Tạo bảng phân công thành công
          </div>
        </div>
      )}
    </div>
  );
}

// --- CSS nội tuyến ---
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
