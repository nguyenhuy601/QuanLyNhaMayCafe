// src/pages/NhapKhoThanhPham.jsx
import React, { useEffect, useState } from "react";
import PhieuNhapThanhPham from "../components/PhieuNhapThanhPham.jsx";
import axiosInstance from '../../../api/axiosConfig';

const NhapKhoThanhPham = () => {
  const [selectedQC, setSelectedQC] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [qcList, setQcList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {

    const fetchQCData = async () => {
      try {
        setLoading(true);
        // Gọi qua API gateway với axiosInstance để có token
        const res = await axiosInstance.get('/qc-result');
        // Lọc chỉ những QC có kết quả đạt
        const passedQC = (Array.isArray(res.data) ? res.data : []).filter(
          item => item.ketQuaChung === 'Dat'
        );
        setQcList(passedQC);
        setError(null);
      } catch (err) {
        setError('Không thể lấy dữ liệu phiếu QC');
      } finally {
        setLoading(false);
      }
    };

    fetchQCData();
  }, []);

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
    <div className="p-6">
      <h2 className="text-xl font-bold text-[#5d2f18] mb-4">Nhập kho thành phẩm</h2>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <p className="text-lg font-semibold">Đang tải dữ liệu...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {!loading && (
        <>
          <div className="bg-white rounded-lg shadow-lg p-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#8B4513] text-white text-sm">
                      <th className="py-3 px-4"></th>
                      <th className="py-3 px-4">Mã phiếu QC</th>
                      <th className="py-3 px-4">Mã sản phẩm</th>
                      <th className="py-3 px-4">Tên sản phẩm</th>
                      <th className="py-3 px-4">Số lượng đạt</th>
                      <th className="py-3 px-4">Ngày kiểm định</th>
                      <th className="py-3 px-4">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {qcList.length > 0 ? (
                      qcList.map((qc, index) => (
                        <tr
                          key={index}
                          className={`border-b hover:bg-[#f9f4ef] transition ${
                            selectedQC?.qcRequest?.maPhieuQC === qc.qcRequest?.maPhieuQC ? "bg-[#f1dfc6]" : ""
                          }`}
                        >
                          <td className="py-2 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={selectedQC?.qcRequest?.maPhieuQC === qc.qcRequest?.maPhieuQC}
                              onChange={() => handleSelect(qc)}
                              className="cursor-pointer"
                            />
                          </td>
                          <td className="py-2 px-4">{qc.qcRequest?.maPhieuQC || "N/A"}</td>
                          <td className="py-2 px-4">{qc.qcRequest?.sanPham?.maSP || "N/A"}</td>
                          <td className="py-2 px-4">{qc.qcRequest?.sanPham?.tenSP || "N/A"}</td>
                          <td className="py-2 px-4">{qc.soLuongDat || 0}</td>
                          <td className="py-2 px-4">
                            {qc.ngayKiemTra
                              ? new Date(qc.ngayKiemTra).toLocaleDateString('vi-VN')
                              : "N/A"}
                          </td>
                          <td className="py-2 px-4">{qc.ghiChu || "—"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="py-4 px-4 text-center text-gray-500">
                          Không có phiếu QC nào đạt
                        </td>
                      </tr>
                    )}
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
            </>
          )}

      {/* Modal hiển thị phiếu nhập */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="relative w-[700px]">
            <PhieuNhapThanhPham selectedQC={selectedQC} onClose={() => setShowModal(false)} />
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
  );
};

export default NhapKhoThanhPham;
