import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

const NhapKhoForm = () => {
  const { state } = useLocation(); // nhận dữ liệu từ PhieuNhap
  const navigate = useNavigate();
  const [trangThai, setTrangThai] = useState("Chưa nhập");

  // Lấy dữ liệu truyền từ PhieuNhap (giả lập nếu chưa có state)
  const phieuData = state?.selectedData || [
    {
      nhaCungCap: "Công ty A",
      nguyenLieu: "Cà phê hạt",
      soLuong: 300,
      donGia: "120.000đ/kg",
      ngayTao: "23/10/2025",
    },
  ];

  const handleSubmit = () => {
    alert(`Phiếu nhập đã được cập nhật: ${trangThai}`);
    navigate("/kho/phieu-nhap");
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8 text-[#5a2e0f] tracking-wide">
        PHIẾU NHẬP KHO NGUYÊN VẬT LIỆU
      </h2>

      {phieuData.map((item, index) => (
        <div
          key={index}
          className="border border-[#e5d2b2] rounded-lg p-5 mb-6 bg-[#fdf8f4]"
        >
          <div className="grid grid-cols-2 gap-4 text-[#3e2a15] text-base">
            <div>
              <label className="font-semibold block mb-1">Nhà cung cấp:</label>
              <input
                value={item.nhaCungCap}
                readOnly
                className="w-full border border-[#e5d2b2] px-3 py-2 rounded-md bg-[#fffdfb]"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Nguyên liệu:</label>
              <input
                value={item.nguyenLieu}
                readOnly
                className="w-full border border-[#e5d2b2] px-3 py-2 rounded-md bg-[#fffdfb]"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Số lượng:</label>
              <input
                value={item.soLuong}
                readOnly
                className="w-full border border-[#e5d2b2] px-3 py-2 rounded-md bg-[#fffdfb]"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Đơn giá:</label>
              <input
                value={item.donGia}
                readOnly
                className="w-full border border-[#e5d2b2] px-3 py-2 rounded-md bg-[#fffdfb]"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Ngày tạo:</label>
              <input
                value={item.ngayTao}
                readOnly
                className="w-full border border-[#e5d2b2] px-3 py-2 rounded-md bg-[#fffdfb]"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Trạng thái:</label>
              <select
                value={trangThai}
                onChange={(e) => setTrangThai(e.target.value)}
                className={`w-full border border-[#e5d2b2] px-3 py-2 rounded-md bg-white ${
                  trangThai === "Đã nhập" ? "text-green-600" : "text-red-600"
                }`}
              >
                <option value="Chưa nhập">Chưa nhập</option>
                <option value="Đã nhập">Đã nhập</option>
              </select>
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-300 px-5 py-2 rounded-md hover:bg-gray-400"
        >
          Quay lại
        </button>

        <button
          onClick={handleSubmit}
          className="bg-[#4a9b5b] text-white px-5 py-2 rounded-md hover:bg-[#3a8148]"
        >
          Xác nhận nhập kho
        </button>
      </div>
    </div>
  );
};

export default NhapKhoForm;
