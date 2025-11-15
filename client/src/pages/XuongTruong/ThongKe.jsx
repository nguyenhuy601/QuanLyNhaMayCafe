import React, { useState } from "react";

export default function ThongKe() {
  const [tab, setTab] = useState("tong-hop");
  const [showPopup, setShowPopup] = useState(false);
  const [filter, setFilter] = useState({
    tuNgay: "",
    denNgay: "",
    toSX: "",
  });

  // ✅ Dữ liệu thống kê tổng hợp
  const dataTongHop = [
    { toSX: "Tổ 1", soLuong: 500, datChuan: 480, loi: 20, tiLeDat: "96%" },
    { toSX: "Tổ 2", soLuong: 420, datChuan: 410, loi: 10, tiLeDat: "97.6%" },
    { toSX: "Tổ 3", soLuong: 600, datChuan: 570, loi: 30, tiLeDat: "95%" },
  ];

  // ✅ Dữ liệu chi tiết lô hàng
  const [dataLoHang] = useState([
    { maLo: "LH001", toSX: "Tổ 1", sanPham: "Cà phê hạt", soLuong: 200, datChuan: 190, loi: 10, ngay: "2025-10-30" },
    { maLo: "LH002", toSX: "Tổ 2", sanPham: "Cà phê bột", soLuong: 300, datChuan: 295, loi: 5, ngay: "2025-10-29" },
    { maLo: "LH003", toSX: "Tổ 3", sanPham: "Cà phê hòa tan", soLuong: 150, datChuan: 140, loi: 10, ngay: "2025-10-29" },
    { maLo: "LH004", toSX: "Tổ 1", sanPham: "Cà phê hạt đặc biệt", soLuong: 250, datChuan: 245, loi: 5, ngay: "2025-10-31" },
  ]);

  // ✅ Lọc dữ liệu theo thời gian và tổ
  const filteredLoHang = dataLoHang.filter((row) => {
    const ngay = new Date(row.ngay);
    const tu = filter.tuNgay ? new Date(filter.tuNgay) : null;
    const den = filter.denNgay ? new Date(filter.denNgay) : null;

    const matchNgay = (!tu || ngay >= tu) && (!den || ngay <= den);
    const matchTo = !filter.toSX || row.toSX === filter.toSX;
    return matchNgay && matchTo;
  });

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 1200);
  };

  return (
    <div
      style={{
        background: "linear-gradient(to bottom, #f4e1c1, #fff5e1)",
        minHeight: "100vh",
        padding: "25px",
        color: "#4b2e18",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "26px",
          fontWeight: "bold",
          color: "#8b5a2b",
          marginBottom: "20px",
        }}
      >
        📊 Thống kê kết quả sản xuất
      </h1>

      {/* --- Tabs --- */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "25px" }}>
        <button
          onClick={() => setTab("tong-hop")}
          style={{
            background: tab === "tong-hop" ? "#8b5a2b" : "#c9a383",
            color: "white",
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "0.2s",
          }}
        >
          Báo cáo tổng hợp
        </button>
        <button
          onClick={() => setTab("chi-tiet")}
          style={{
            background: tab === "chi-tiet" ? "#8b5a2b" : "#c9a383",
            color: "white",
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "0.2s",
          }}
        >
          Chi tiết theo lô hàng
        </button>
      </div>

      {/* --- Bộ lọc --- */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          background: "#fff",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
          alignItems: "flex-end",
          marginBottom: "25px",
        }}
      >
        <div>
          <label style={labelStyle}>Từ ngày</label>
          <input type="date" name="tuNgay" value={filter.tuNgay} onChange={handleFilterChange} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Đến ngày</label>
          <input type="date" name="denNgay" value={filter.denNgay} onChange={handleFilterChange} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Tổ sản xuất</label>
          <select name="toSX" value={filter.toSX} onChange={handleFilterChange} style={selectStyle}>
            <option value="">-- Tất cả tổ --</option>
            <option value="Tổ 1">Tổ 1</option>
            <option value="Tổ 2">Tổ 2</option>
            <option value="Tổ 3">Tổ 3</option>
          </select>
        </div>
        <button
          onClick={handleSearch}
          style={{
            background: "#8b5a2b",
            color: "white",
            border: "none",
            padding: "10px 30px",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#a06730")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#8b5a2b")}
        >
          🔍 Tìm lô hàng
        </button>
      </div>

      {/* --- Bảng dữ liệu --- */}
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        <table style={tableStyle}>
          <thead style={theadStyle}>
            {tab === "tong-hop" ? (
              <tr>
                <th>Tổ sản xuất</th>
                <th>Tổng sản lượng</th>
                <th>Đạt chuẩn</th>
                <th>Lỗi</th>
                <th>Tỷ lệ đạt</th>
              </tr>
            ) : (
              <tr>
                <th>Mã lô</th>
                <th>Tổ sản xuất</th>
                <th>Sản phẩm</th>
                <th>Số lượng</th>
                <th>Đạt chuẩn</th>
                <th>Lỗi</th>
                <th>Ngày sản xuất</th>
              </tr>
            )}
          </thead>
          <tbody>
            {tab === "tong-hop"
              ? dataTongHop.map((row, i) => (
                  <tr key={i} style={tbodyRowStyle}>
                    <td>{row.toSX}</td>
                    <td>{row.soLuong}</td>
                    <td>{row.datChuan}</td>
                    <td>{row.loi}</td>
                    <td style={{ fontWeight: "bold", color: "#8b5a2b" }}>{row.tiLeDat}</td>
                  </tr>
                ))
              : filteredLoHang.length > 0
              ? filteredLoHang.map((row, i) => (
                  <tr key={i} style={tbodyRowStyle}>
                    <td>{row.maLo}</td>
                    <td>{row.toSX}</td>
                    <td>{row.sanPham}</td>
                    <td>{row.soLuong}</td>
                    <td>{row.datChuan}</td>
                    <td>{row.loi}</td>
                    <td>{row.ngay}</td>
                  </tr>
                ))
              : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "20px", color: "#555" }}>
                    Không tìm thấy lô hàng trong khoảng thời gian này.
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>

      {/* --- Popup --- */}
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
              background: "#8b5a2b",
              color: "white",
              padding: "15px 30px",
              borderRadius: "25px",
              fontWeight: "bold",
              boxShadow: "0 3px 8px rgba(0,0,0,0.3)",
            }}
          >
            ✅ Đã lọc lô hàng thành công
          </div>
        </div>
      )}
    </div>
  );
}

// --- CSS nội tuyến ---
const labelStyle = { display: "block", fontWeight: "bold", marginBottom: "5px", color: "#4b2e18" };

const inputStyle = {
  padding: "8px",
  border: "1px solid #c9a383",
  borderRadius: "6px",
  width: "160px",
  background: "#fffaf3",
};

const selectStyle = {
  ...inputStyle,
  width: "180px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  color: "#4b2e18",
  fontSize: "15px",
};

const theadStyle = {
  background: "#8b5a2b",
  color: "white",
  textAlign: "center",
};

const tbodyRowStyle = {
  borderBottom: "1px solid #ddd",
  textAlign: "center",
  backgroundColor: "#fffaf3",
  transition: "0.2s",
  height: "40px",
};
