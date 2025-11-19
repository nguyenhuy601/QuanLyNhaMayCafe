import React, { useState, useEffect } from "react";
import { CalendarDays, Search, ClipboardList, Info } from "lucide-react";

export default function XemKeHoach() {
  const [filter, setFilter] = useState({ tuNgay: "", denNgay: "", maKeHoach: "" });
  const [selectedPlan, setSelectedPlan] = useState(null);

  // CSS nội tuyến - tự động chèn vào head (dễ quản lý 1 file)
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .xk-wrapper {
        padding: 24px;
        background-color: #fff9f3;
        min-height: 100vh;
        font-family: "Segoe UI", sans-serif;
        color: #4a2c0a;
      }

      .xk-title {
        font-size: 22px;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 20px;
        color: #5c2e00;
      }

      .xk-filter {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        background: #ffffff;
        border: 1px solid #f3d7a7;
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 20px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.05);
      }

      .filter-input, .filter-date {
        display: flex;
        align-items: center;
        border: 1px solid #f0d199;
        border-radius: 8px;
        padding: 6px 10px;
        background-color: #fff;
      }

      .filter-input input, .filter-date input {
        border: none;
        outline: none;
        font-size: 14px;
        background: transparent;
        color: #4a2c0a;
      }

      .filter-input .icon, .filter-date .icon {
        margin-right: 6px;
        color: #b87e3c;
      }

      .xk-table table {
        width: 100%;
        border-collapse: collapse;
        background: #fff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 6px rgba(0,0,0,0.05);
      }

      .xk-table th {
        background: #f6d58f;
        color: #4a2c0a;
        padding: 12px;
        text-align: left;
        font-weight: 600;
        font-size: 14px;
      }

      .xk-table td {
        padding: 10px 12px;
        border-top: 1px solid #f3e1b6;
        font-size: 14px;
      }

      .xk-table tr:hover {
        background-color: #fff3dd;
      }

      .xk-table button {
        background: #e0a647;
        color: white;
        border: none;
        border-radius: 6px;
        padding: 6px 10px;
        font-size: 13px;
        cursor: pointer;
        transition: 0.2s;
      }

      .xk-table button:hover {
        background: #c98c33;
      }

      /* Modal chi tiết kế hoạch */
      .xk-modal {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.45);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 99;
      }

      .modal-content {
        background: #fff;
        border-radius: 12px;
        padding: 24px;
        width: 460px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      }

      .modal-content h2 {
        font-size: 18px;
        color: #5c2e00;
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 12px;
      }

      .modal-content p {
        margin: 6px 0;
        font-size: 14px;
      }

      .modal-actions {
        text-align: right;
        margin-top: 14px;
      }

      .modal-actions button {
        background: #b9761b;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 8px 14px;
        cursor: pointer;
      }

      .modal-actions button:hover {
        background: #945a14;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const danhSachKeHoach = [
    {
      maKeHoach: "KH001",
      sanPham: "Cà phê hạt Arabica 500g",
      maLo: "LO001",
      ngayBatDau: "2025-10-20",
      ngayKetThuc: "2025-10-28",
      toSanXuat: "Tổ 1",
      soLuong: 500,
      trangThai: "Hoàn thành",
    },
    {
      maKeHoach: "KH002",
      sanPham: "Cà phê hòa tan 3in1",
      maLo: "LO002",
      ngayBatDau: "2025-10-25",
      ngayKetThuc: "2025-11-05",
      toSanXuat: "Tổ 2",
      soLuong: 400,
      trangThai: "Đang sản xuất",
    },
  ];

  const filteredData = danhSachKeHoach.filter((item) => {
    const tu = filter.tuNgay ? new Date(filter.tuNgay) : null;
    const den = filter.denNgay ? new Date(filter.denNgay) : null;
    const ngayBD = new Date(item.ngayBatDau);
    const matchDate = (!tu || ngayBD >= tu) && (!den || ngayBD <= den);
    const matchMa = !filter.maKeHoach || item.maKeHoach.includes(filter.maKeHoach);
    return matchDate && matchMa;
  });

  return (
    <div className="xk-wrapper">
      <h1 className="xk-title">
        <ClipboardList size={24} />
        Xem kế hoạch sản xuất
      </h1>

      <div className="xk-filter">
        <div className="filter-input">
          <Search size={18} className="icon" />
          <input
            type="text"
            placeholder="Nhập mã kế hoạch..."
            value={filter.maKeHoach}
            onChange={(e) => setFilter({ ...filter, maKeHoach: e.target.value })}
          />
        </div>
        <div className="filter-date">
          <CalendarDays size={18} className="icon" />
          <input
            type="date"
            value={filter.tuNgay}
            onChange={(e) => setFilter({ ...filter, tuNgay: e.target.value })}
          />
        </div>
        <div className="filter-date">
          <CalendarDays size={18} className="icon" />
          <input
            type="date"
            value={filter.denNgay}
            onChange={(e) => setFilter({ ...filter, denNgay: e.target.value })}
          />
        </div>
      </div>

      <div className="xk-table">
        <table>
          <thead>
            <tr>
              <th>Mã kế hoạch</th>
              <th>Mã lô</th>
              <th>Sản phẩm</th>
              <th>Tổ sản xuất</th>
              <th>Ngày bắt đầu</th>
              <th>Ngày kết thúc</th>
              <th>Trạng thái</th>
              <th>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row) => (
              <tr key={row.maKeHoach}>
                <td>{row.maKeHoach}</td>
                <td>{row.maLo}</td>
                <td>{row.sanPham}</td>
                <td>{row.toSanXuat}</td>
                <td>{row.ngayBatDau}</td>
                <td>{row.ngayKetThuc}</td>
                <td>{row.trangThai}</td>
                <td>
                  <button onClick={() => setSelectedPlan(row)}>Xem chi tiết</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedPlan && (
        <div className="xk-modal">
          <div className="modal-content">
            <h2>
              <Info size={20} /> Chi tiết kế hoạch
            </h2>
            <p><strong>Mã kế hoạch:</strong> {selectedPlan.maKeHoach}</p>
            <p><strong>Mã lô hàng:</strong> {selectedPlan.maLo}</p>
            <p><strong>Sản phẩm:</strong> {selectedPlan.sanPham}</p>
            <p><strong>Tổ sản xuất:</strong> {selectedPlan.toSanXuat}</p>
            <p><strong>Số lượng:</strong> {selectedPlan.soLuong}</p>
            <p><strong>Thời gian:</strong> {selectedPlan.ngayBatDau} → {selectedPlan.ngayKetThuc}</p>
            <p><strong>Trạng thái:</strong> {selectedPlan.trangThai}</p>
            <div className="modal-actions">
              <button onClick={() => setSelectedPlan(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
