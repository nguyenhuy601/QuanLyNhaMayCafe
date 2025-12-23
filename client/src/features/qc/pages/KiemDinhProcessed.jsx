import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../../api/axiosConfig";
import { Filter, Edit2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useRealtime from "../../../hooks/useRealtime";

const KiemDinhProcessed = () => {
  const [requests, setRequests] = useState([]);
  const [filterKetQua, setFilterKetQua] = useState("Tất cả");
  const [filterXuong, setFilterXuong] = useState("Tất cả");
  const navigate = useNavigate();

  const fetchProcessedRequests = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/qc-result");
      setRequests(res.data);
    } catch (err) {
    }
  }, []);

  useEffect(() => {
    fetchProcessedRequests();
  }, [fetchProcessedRequests]);

  // Realtime updates
  useRealtime({
    eventHandlers: {
      QC_RESULT_CREATED: fetchProcessedRequests,
      QC_RESULT_UPDATED: fetchProcessedRequests,
      QC_PASSED: fetchProcessedRequests,
      QC_FAILED: fetchProcessedRequests,
      qc_events: fetchProcessedRequests, // Generic QC events
    },
  });

  // Lấy danh sách xưởng & kết quả (unique)
  const xuongOptions = ["Tất cả", ...new Set(requests.map((r) => r.qcRequest?.xuong))];
  const ketQuaOptions = ["Tất cả", ...new Set(requests.map((r) => r.ketQuaChung))];

  // Lọc dữ liệu
  const filteredData = requests.filter((item) => {
    const matchKetQua =
      filterKetQua === "Tất cả" || item.ketQuaChung === filterKetQua;
    const matchXuong =
      filterXuong === "Tất cả" || item.qcRequest?.xuong === filterXuong;
    return matchKetQua && matchXuong;
  });

  const handleEdit = (id) => {
    navigate(`/qc/kiem-dinh/${id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa kết quả kiểm định này?")) return;
    try {
      await axiosInstance.delete(`/qc-result/${id}`);
      setRequests(requests.filter((req) => req._id !== id));
    } catch (err) {
    }
  };

  // ✅ Hàm xử lý màu kết quả
  const getKetQuaColor = (ketQua) => {
    const value = ketQua?.toLowerCase().trim();
    if (value === "dat" || value === "đạt") return "text-green-700 font-semibold";
    if (value === "khong dat" || value === "không đạt")
      return "text-red-600 font-semibold";
    return "text-gray-700";
  };

  return (
    <div className="h-full p-6">
      <h2 className="text-2xl font-bold mb-6 text-center text-[#5a2e0f] tracking-wide">
        DANH SÁCH PHIẾU ĐÃ KIỂM ĐỊNH
      </h2>

      {/* Bộ lọc */}
      <div className="flex flex-wrap items-center justify-end mb-4 gap-4">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-[#8b4513]" />
          <label className="text-[#5a2e0f] text-sm font-medium">Kết quả:</label>
          <select
            value={filterKetQua}
            onChange={(e) => setFilterKetQua(e.target.value)}
            className="border border-[#a0522d] rounded-md px-3 py-1 text-[#3e2a15]"
          >
            {ketQuaOptions.map((k, i) => (
              <option key={i} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Filter size={18} className="text-[#8b4513]" />
          <label className="text-[#5a2e0f] text-sm font-medium">Xưởng:</label>
          <select
            value={filterXuong}
            onChange={(e) => setFilterXuong(e.target.value)}
            className="border border-[#a0522d] rounded-md px-3 py-1 text-[#3e2a15]"
          >
            {xuongOptions.map((x, i) => (
              <option key={i} value={x}>
                {x}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bảng */}
      <div className="overflow-hidden rounded-lg border border-[#e5d2b2] shadow-md">
        <table className="min-w-full text-sm text-center text-[#3e2a15]">
          <thead className="bg-[#8b4513] text-white">
            <tr>
              <th className="py-3 px-3 font-semibold">STT</th>
              <th className="py-3 px-3 font-semibold">Mã phiếu QC</th>
              <th className="py-3 px-3 font-semibold">Sản phẩm</th>
              <th className="py-3 px-3 font-semibold">Xưởng</th>
              <th className="py-3 px-3 font-semibold">Kết quả</th>
              <th className="py-3 px-3 font-semibold">Số lượng đạt</th>
              <th className="py-3 px-3 font-semibold">Số lượng lỗi</th>
              <th className="py-3 px-3 font-semibold">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#f1e3d1]">
            {filteredData.length > 0 ? (
              filteredData.map((row, index) => (
                <tr
                  key={row._id}
                  className="hover:bg-[#f8efe7] transition-all duration-150 hover:shadow-sm"
                >
                  <td className="py-3 px-3">{index + 1}</td>
                  <td className="py-3 px-3">{row.qcRequest?.maPhieuQC || "-"}</td>
                  <td className="py-3 px-3">{row.qcRequest?.sanPham?.ProductName || "-"}</td>
                  <td className="py-3 px-3">{row.qcRequest?.xuong || "-"}</td>
                  <td className={`py-3 px-3 ${getKetQuaColor(row.ketQuaChung)}`}>
                    {row.ketQuaChung || "-"}
                  </td>
                  <td className="py-3 px-3">{row.soLuongDat}</td>
                  <td className="py-3 px-3">{row.soLuongLoi}</td>
                  <td className="py-3 px-3 flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(row._id)}
                      className="bg-[#4a9b5b] hover:bg-[#3a8148] text-white px-3 py-1 rounded-md flex items-center gap-1"
                    >
                      <Edit2 size={16} />
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(row._id)}
                      className="bg-[#c54b3a] hover:bg-[#a13b2c] text-white px-3 py-1 rounded-md flex items-center gap-1"
                    >
                      <Trash2 size={16} />
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="py-4 text-gray-500 italic">
                  Không có phiếu nào phù hợp
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KiemDinhProcessed;
