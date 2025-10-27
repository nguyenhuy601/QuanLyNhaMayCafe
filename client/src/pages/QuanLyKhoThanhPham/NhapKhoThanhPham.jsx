// src/pages/NhapKhoThanhPham.jsx
import React, { useState } from "react";
import Header from "../../components/QuanLyKhoThanhPham/header";
import Sidebar from "../../components/QuanLyKhoThanhPham/sidebar";
import Topbar from "../../components/QuanLyKhoThanhPham/topbar";
import Welcome from "../../components/QuanLyKhoThanhPham/welcome";
import PhieuNhapThanhPham from "../../components/QuanLyKhoThanhPham/PhieuNhapThanhPham";

const NhapKhoThanhPham = () => {
  const [selectedQC, setSelectedQC] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Giả lập danh sách phiếu QC đạt yêu cầu
  const qcList = [
    { maPhieuQC: "QC001", maSP: "SP004", tenSP: "cafe rang xay arabica", soLuong: "5000/Túi", ngayKiemDinh: "27/07/2025" },
    { maPhieuQC: "QC002", maSP: "SP001", tenSP: "cafe hạt robusta", soLuong: "5000/Túi", ngayKiemDinh: "27/07/2025" },
    { maPhieuQC: "QC003", maSP: "SP002", tenSP: "cafe chồn", soLuong: "1200/Túi", ngayKiemDinh: "27/07/2025" },
    { maPhieuQC: "QC004", maSP: "SP004", tenSP: "cafe rang xay arabica", soLuong: "5000/Túi", ngayKiemDinh: "18/10/2025" },
    { maPhieuQC: "QC005", maSP: "SP007", tenSP: "cafe hòa tan robusta", soLuong: "3000/Túi", ngayKiemDinh: "20/10/2025" },
  ];

  const handleSelect = (qc) => {
    setSelectedQC(qc);
  };

  const handleCreatePhieuNhap = () => {
    if (!selectedQC) {
      alert("Vui lòng chọn ít nhất một phiếu QC để tạo phiếu nhập.");
      return;
    }
    setShowModal(true);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Nội dung chính */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header />

        {/* Nội dung trang */}
        <div className="p-6">
          <h2 className="text-xl font-bold text-[#5d2f18] mb-4"> Nhập kho thành phẩm</h2>

          <div className="bg-white rounded-lg shadow-lg p-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#8B4513] text-white text-sm">
                  <th className="py-3 px-4"></th>
                  <th className="py-3 px-4">Mã phiếu QC</th>
                  <th className="py-3 px-4">Mã sản phẩm</th>
                  <th className="py-3 px-4">Tên sản phẩm</th>
                  <th className="py-3 px-4">Số lượng</th>
                  <th className="py-3 px-4">Ngày kiểm định</th>
                  <th className="py-3 px-4">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {qcList.map((qc, index) => (
                  <tr
                    key={index}
                    className={`border-b hover:bg-[#f9f4ef] transition ${
                      selectedQC?.maPhieuQC === qc.maPhieuQC ? "bg-[#f1dfc6]" : ""
                    }`}
                  >
                    <td className="py-2 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedQC?.maPhieuQC === qc.maPhieuQC}
                        onChange={() => handleSelect(qc)}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="py-2 px-4">{qc.maPhieuQC}</td>
                    <td className="py-2 px-4">{qc.maSP}</td>
                    <td className="py-2 px-4">{qc.tenSP}</td>
                    <td className="py-2 px-4">{qc.soLuong}</td>
                    <td className="py-2 px-4">{qc.ngayKiemDinh}</td>
                    <td className="py-2 px-4">—</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Nút tạo phiếu nhập */}
            <div className="flex justify-center mt-6">
              <button
                onClick={handleCreatePhieuNhap}
                className="px-6 py-3 rounded-lg text-white font-bold shadow-md transition-all"
                style={{ backgroundColor: "#8B4513" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#A0522D")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#8B4513")}
              >
                Tạo phiếu nhập thành phẩm
              </button>
            </div>
          </div>
        </div>

        {/* Modal hiển thị phiếu nhập */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="relative w-[700px]">
              <PhieuNhapThanhPham />
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NhapKhoThanhPham;
