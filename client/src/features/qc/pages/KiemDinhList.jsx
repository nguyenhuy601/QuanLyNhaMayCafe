import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Filter } from "lucide-react";
import axiosInstance from "../../../api/axiosConfig";

const KiemDinhList = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [filterTrangThai, setFilterTrangThai] = useState("Tất cả");
  const [filterXuong, setFilterXuong] = useState("Tất cả");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axiosInstance.get("/qc-request");
        setRequests(res.data);
      } catch (err) {
      }
    };
    fetchRequests();
  }, []);

  // Lấy danh sách xưởng (unique)
  const xuongOptions = ["Tất cả", ...new Set(requests.map((r) => r.xuong))];

  // Lọc dữ liệu
  const filteredData = requests.filter((item) => {
    const matchTrangThai =
      filterTrangThai === "Tất cả" || item.trangThai === filterTrangThai;
    const matchXuong = filterXuong === "Tất cả" || item.xuong === filterXuong;
    return matchTrangThai && matchXuong;
  });

  return (
    <div className="h-full p-6">
      <h2 className="text-2xl font-bold mb-6 text-center text-[#5a2e0f] tracking-wide">
        DANH SÁCH PHIẾU YÊU CẦU KIỂM ĐỊNH
      </h2>

      {/* Bộ lọc */}
      <div className="flex flex-wrap items-center justify-end mb-4 gap-4">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-[#8b4513]" />
          <label className="text-[#5a2e0f] text-sm font-medium">Trạng thái:</label>
          <select
            value={filterTrangThai}
            onChange={(e) => setFilterTrangThai(e.target.value)}
            className="border border-[#a0522d] rounded-md px-3 py-1 text-[#3e2a15]"
          >
            <option value="Tất cả">Tất cả</option>
            <option value="Chưa kiểm định">Chưa kiểm định</option>
            <option value="Đã kiểm định">Đã kiểm định</option>
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
              <th className="py-3 px-3 font-semibold">Xưởng</th>
              <th className="py-3 px-3 font-semibold">Sản phẩm</th>
              <th className="py-3 px-3 font-semibold">Ngày yêu cầu</th>
              <th className="py-3 px-3 font-semibold">Người yêu cầu</th>
              <th className="py-3 px-3 font-semibold">Số lượng</th>
              <th className="py-3 px-3 font-semibold">Trạng thái</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-[#f1e3d1]">
            {filteredData.length > 0 ? (
              filteredData.map((row, index) => (
                <tr
                  key={row._id}
                  onClick={() => navigate(`/qc/kiem-dinh/${row._id}`)}
                  className="cursor-pointer hover:bg-[#f8efe7] transition-all duration-150 hover:shadow-sm"
                >
                  <td className="py-3 px-3">{index + 1}</td>
                  <td className="py-3 px-3">{row.maPhieuQC}</td>
                  <td className="py-3 px-3">{row.xuong}</td>
                  <td className="py-3 px-3">
                    {row.sanPham?.ProductName || row.sanPhamName || "Chưa có tên"}
                  </td>
                  <td className="py-3 px-3">
                    {new Date(row.ngayYeuCau).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="py-3 px-3">{row.nguoiYeuCau}</td>
                  <td className="py-3 px-3">{row.soLuong}</td>
                  <td
                    className={`py-3 px-3 font-medium ${
                      row.trangThai === "Đã kiểm định"
                        ? "text-green-700"
                        : "text-[#c97a44]"
                    }`}
                  >
                    {row.trangThai}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-4 text-gray-500 italic">
                  Không có dữ liệu phù hợp
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KiemDinhList;
