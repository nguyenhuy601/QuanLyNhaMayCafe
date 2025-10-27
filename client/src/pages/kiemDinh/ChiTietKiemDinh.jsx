import { useState } from "react";
import KDThanhCong from "../../components/kiemDinh/KDThanhCong";
import KDThatBai from "../../components/kiemDinh/KDThatBai";
import KDThoat from "../../components/kiemDinh/KDThoat";
import GhiChu from "../../components/kiemDinh/GhiChu";
import { CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ChiTietKiemDinh = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFail, setShowFail] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [ketQua, setKetQua] = useState("Đạt");

  const navigate = useNavigate();

  const handleSelectChange = (e) => {
    const value = e.target.value;
    setKetQua(value);

    // Nếu chọn "Không đạt", bật modal ghi chú trước
    if (value === "Không đạt") {
      setShowNote(true);
    }
  };

  const handleConfirmResult = () => {
    // Bất kể đạt hay không đạt, vẫn xem là lưu thành công
    setShowSuccess(true);
  };


  return (
    <div className="p-6 bg-[#fffdfb] rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8 text-[#5a2e0f] tracking-wide">
        CẬP NHẬT KẾT QUẢ KIỂM ĐỊNH
      </h2>

      {/* Form chi tiết */}
      <form className="flex flex-col gap-5 text-[#3e2a15] text-lg">
        <div>
          <label className="block font-semibold mb-1">Tên xưởng:</label>
          <input
            value="Xưởng chế biến - C1"
            readOnly
            className="border border-[#e5d2b2] bg-[#fdf8f4] rounded-md px-3 py-2 w-full"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Số lô:</label>
          <input
            value="SL001"
            readOnly
            className="border border-[#e5d2b2] bg-[#fdf8f4] rounded-md px-3 py-2 w-full"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Ngày kiểm tra:</label>
          <input
            value="23/08/2025"
            readOnly
            className="border border-[#e5d2b2] bg-[#fdf8f4] rounded-md px-3 py-2 w-full"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Người kiểm tra:</label>
          <input
            value="Nguyễn Văn A"
            readOnly
            className="border border-[#e5d2b2] bg-[#fdf8f4] rounded-md px-3 py-2 w-full"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Tên sản phẩm:</label>
          <input
            value="Bột cà phê xay nhuyễn"
            readOnly
            className="border border-[#e5d2b2] bg-[#fdf8f4] rounded-md px-3 py-2 w-full"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Số lượng:</label>
          <input
            value="200"
            readOnly
            className="border border-[#e5d2b2] bg-[#fdf8f4] rounded-md px-3 py-2 w-full"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Kết quả kiểm định:</label>
          <select
            className={`border border-[#e5d2b2] rounded-md px-3 py-2 w-full text-base ${
              ketQua === "Đạt" ? "text-green-600" : "text-red-600"
            }`}
            value={ketQua}
            onChange={handleSelectChange}
          >
            <option value="Đạt">Đạt</option>
            <option value="Không đạt">Không đạt</option>
          </select>
        </div>

        {/* Nút hành động */}
        <div className="flex justify-center mt-6 gap-4">
          <button
            type="button"
            onClick={() => setShowExit(true)}
            className="flex items-center gap-2 bg-[#c54b3a] hover:bg-[#a13b2c] text-white px-5 py-2.5 rounded-md shadow-md transition-all duration-200 hover:shadow-lg"
          >
            <XCircle size={18} />
            <span>Hủy kiểm định</span>
          </button>

          <button
            type="button"
            onClick={handleConfirmResult}
            className="flex items-center gap-2 bg-[#4a9b5b] hover:bg-[#3a8148] text-white px-5 py-2.5 rounded-md shadow-md transition-all duration-200 hover:shadow-lg"
          >
            <CheckCircle size={18} />
            <span>Xác nhận kết quả</span>
          </button>
        </div>
      </form>

      {/* Các modal */}
      {showSuccess && <KDThanhCong onClose={() => setShowSuccess(false)} />}
      {showFail && <KDThatBai onClose={() => setShowFail(false)} />}
      {showNote && <GhiChu onClose={() => setShowNote(false)} />}
      {showExit && (
        <KDThoat
          onClose={() => setShowExit(false)}
          onConfirm={() => {
            setShowExit(false);
            navigate("/qc/kiem-dinh");
          }}
        />
      )}
    </div>
  );
};

export default ChiTietKiemDinh;
