import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ChonKeHoachNhap = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);

  const keHoachData = [
    { id: 1, nhaCungCap: "Công ty A", nguyenLieu: "Cà phê hạt", soLuong: 200 },
    { id: 2, nhaCungCap: "Công ty A", nguyenLieu: "Cà phê hạt", soLuong: 150 },
    { id: 3, nhaCungCap: "Công ty B", nguyenLieu: "Đường", soLuong: 50 },
  ];

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    if (selected.length === 0) {
      alert("Vui lòng chọn ít nhất 1 kế hoạch!");
      return;
    }
    navigate("/kho/nhap-kho/tao-phieu", { state: { selected } });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-6 text-center text-[#5a2e0f]">
        CHỌN KẾ HOẠCH NHẬP KHO
      </h2>

      <table className="min-w-full border text-center">
        <thead className="bg-[#f4e5d4]">
          <tr>
            <th className="border px-3 py-2">Chọn</th>
            <th className="border px-3 py-2">Nhà cung cấp</th>
            <th className="border px-3 py-2">Nguyên liệu</th>
            <th className="border px-3 py-2">Số lượng</th>
          </tr>
        </thead>
        <tbody>
          {keHoachData.map((item) => (
            <tr
              key={item.id}
              className="hover:bg-[#fdf6f0] transition cursor-pointer"
              onClick={() => toggleSelect(item.id)}
            >
              <td className="border px-3 py-2">
                <input
                  type="checkbox"
                  checked={selected.includes(item.id)}
                  onChange={() => toggleSelect(item.id)}
                />
              </td>
              <td className="border px-3 py-2">{item.nhaCungCap}</td>
              <td className="border px-3 py-2">{item.nguyenLieu}</td>
              <td className="border px-3 py-2">{item.soLuong}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-center mt-6">
        <button
          onClick={handleContinue}
          className="bg-[#8b4513] hover:bg-[#a0522d] text-white px-5 py-2 rounded-md shadow-md transition"
        >
          Tiếp tục ➜
        </button>
      </div>
    </div>
  );
};

export default ChonKeHoachNhap;
