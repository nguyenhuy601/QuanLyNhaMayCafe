import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Filter } from "lucide-react";

const KiemDinhList = () => {
  const navigate = useNavigate();

  const [filterTrangThai, setFilterTrangThai] = useState("Tất cả");
  const [filterXuong, setFilterXuong] = useState("Tất cả");

  const data = [
    {
      id: 1,
      xuong: "Xưởng chế biến - C1",
      ngay: "23/08/2025",
      nguoi: "Nguyễn Văn A",
      soLuong: 10,
      trangThai: "Chưa kiểm định",
    },
    {
      id: 2,
      xuong: "Xưởng chế biến - C2",
      ngay: "25/08/2025",
      nguoi: "Trần Thị B",
      soLuong: 8,
      trangThai: "Đã kiểm định",
    },
    {
      id: 3,
      xuong: "Xưởng chế biến - C1",
      ngay: "30/08/2025",
      nguoi: "Lê Văn C",
      soLuong: 12,
      trangThai: "Đã kiểm định",
    },
  ];

  // Lấy danh sách xưởng không trùng lặp
  const xuongOptions = ["Tất cả", ...new Set(data.map((d) => d.xuong))];

  // Lọc dữ liệu theo trạng thái và xưởng
  const filteredData = data.filter((item) => {
    const matchTrangThai =
      filterTrangThai === "Tất cả" || item.trangThai === filterTrangThai;
    const matchXuong = filterXuong === "Tất cả" || item.xuong === filterXuong;
    return matchTrangThai && matchXuong;
  });

  return (
    <div className="p-6 bg-[#fffdfb] rounded-lg shadow-md">
      {/* Tiêu đề */}
      <h2 className="text-2xl font-bold mb-6 text-center text-[#5a2e0f] tracking-wide">
        DANH SÁCH PHIẾU YÊU CẦU KIỂM ĐỊNH
      </h2>

      {/* Thanh lọc */}
      <div className="flex flex-wrap items-center justify-end mb-4 gap-4">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-[#8b4513]" />
          <label className="text-[#5a2e0f] text-sm font-medium">
            Trạng thái:
          </label>
          <select
            value={filterTrangThai}
            onChange={(e) => setFilterTrangThai(e.target.value)}
            className="border border-[#a0522d] rounded-md px-3 py-1 text-[#3e2a15] focus:outline-none focus:ring-2 focus:ring-[#a0522d]"
          >
            <option value="Tất cả">Tất cả</option>
            <option value="Chưa kiểm định">Chưa kiểm định</option>
            <option value="Đã kiểm định">Đã kiểm định</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Filter size={18} className="text-[#8b4513]" />
          <label className="text-[#5a2e0f] text-sm font-medium">
            Xưởng:
          </label>
          <select
            value={filterXuong}
            onChange={(e) => setFilterXuong(e.target.value)}
            className="border border-[#a0522d] rounded-md px-3 py-1 text-[#3e2a15] focus:outline-none focus:ring-2 focus:ring-[#a0522d]"
          >
            {xuongOptions.map((xuong, index) => (
              <option key={index} value={xuong}>
                {xuong}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="overflow-hidden rounded-lg border border-[#e5d2b2] shadow-md">
        <table className="min-w-full text-sm text-center text-[#3e2a15]">
          <thead className="bg-[#8b4513] text-white">
            <tr>
              <th className="py-3 px-4 font-semibold">STT</th>
              <th className="py-3 px-4 font-semibold">Tên xưởng yêu cầu</th>
              <th className="py-3 px-4 font-semibold">Ngày yêu cầu</th>
              <th className="py-3 px-4 font-semibold">Người yêu cầu</th>
              <th className="py-3 px-4 font-semibold">Số lượng</th>
              <th className="py-3 px-4 font-semibold">Trạng thái</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-[#f1e3d1]">
            {filteredData.length > 0 ? (
              filteredData.map((row, index) => (
                <tr
                  key={row.id}
                  onClick={() => navigate(`/qc/kiem-dinh/${row.id}`)}
                  className="cursor-pointer hover:bg-[#f8efe7] transition-all duration-150 hover:shadow-sm"
                >
                  <td className="py-3 px-4 font-medium">{index + 1}</td>
                  <td className="py-3 px-4">{row.xuong}</td>
                  <td className="py-3 px-4">{row.ngay}</td>
                  <td className="py-3 px-4">{row.nguoi}</td>
                  <td className="py-3 px-4">{row.soLuong}</td>
                  <td
                    className={`py-3 px-4 font-medium ${
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
                <td colSpan="6" className="py-4 text-gray-500 italic">
                  Không có dữ liệu phù hợp
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Ghi chú */}
      <div className="mt-4 text-sm text-[#5a2e0f] italic text-center">
        Nhấp vào từng dòng để xem chi tiết phiếu kiểm định ☕
      </div>
    </div>
  );
};

export default KiemDinhList;
