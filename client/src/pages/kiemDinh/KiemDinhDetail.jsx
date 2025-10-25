import { useState } from "react";
import ConfirmSuccessModal from "../../components/kiemDinh/ConfirmSuccessModal";
import NoteModal from "../../components/kiemDinh/NoteModal";
import { CheckCircle, XCircle } from "lucide-react";

const KiemDinhDetail = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [ketQua, setKetQua] = useState("Đạt"); // State theo dõi kết quả kiểm định

  return (
    <div className="p-6 bg-[#fffdfb] rounded-lg shadow-md max-w-4xl mx-auto">
      {/* Tiêu đề */}
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
            className="border border-[#e5d2b2] bg-[#fdf8f4] rounded-md px-3 py-2 w-full text-base focus:ring-2 focus:ring-[#a0522d] outline-none"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Số lô:</label>
          <input
            value="SL001"
            readOnly
            className="border border-[#e5d2b2] bg-[#fdf8f4] rounded-md px-3 py-2 w-full text-base"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Ngày kiểm tra:</label>
          <input
            value="23/08/2025"
            readOnly
            className="border border-[#e5d2b2] bg-[#fdf8f4] rounded-md px-3 py-2 w-full text-base"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Người kiểm tra:</label>
          <input
            value="Nguyễn Văn A"
            readOnly
            className="border border-[#e5d2b2] bg-[#fdf8f4] rounded-md px-3 py-2 w-full text-base"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Tên sản phẩm:</label>
          <input
            value="Bột cà phê xay nhuyễn"
            readOnly
            className="border border-[#e5d2b2] bg-[#fdf8f4] rounded-md px-3 py-2 w-full text-base"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Số lượng:</label>
          <input
            value="200"
            readOnly
            className="border border-[#e5d2b2] bg-[#fdf8f4] rounded-md px-3 py-2 w-full text-base"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Kết quả kiểm định:</label>
          <select
            className={`border border-[#e5d2b2] rounded-md px-3 py-2 w-full text-base ${ketQua === "Đạt" ? "text-green-600" : "text-red-600"
              }`}
            value={ketQua}
            onChange={(e) => {
              const value = e.target.value;
              setKetQua(value);
              if (value === "Không đạt") {
                setShowNote(true); // bật modal
              }
            }}
          >
            <option value="Đạt">Đạt</option>
            <option value="Không đạt">Không đạt</option>
          </select>
        </div>

        {/* Nút hành động */}
        <div className="flex justify-center mt-6 gap-4">
          <button
            type="button"
            onClick={() => setShowNote(true)}
            className="flex items-center gap-2 bg-[#c54b3a] hover:bg-[#a13b2c] text-white px-5 py-2.5 rounded-md shadow-md transition-all duration-200 hover:shadow-lg"
          >
            <XCircle size={18} />
            <span>Hủy kiểm định</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSuccess(true)}
            className="flex items-center gap-2 bg-[#4a9b5b] hover:bg-[#3a8148] text-white px-5 py-2.5 rounded-md shadow-md transition-all duration-200 hover:shadow-lg"
          >
            <CheckCircle size={18} />
            <span>Xác nhận kết quả</span>
          </button>
        </div>
      </form>

      {/* Modal */}
      {showSuccess && <ConfirmSuccessModal onClose={() => setShowSuccess(false)} />}
      {showNote && <NoteModal onClose={() => setShowNote(false)} />}
    </div>
  );
};

export default KiemDinhDetail;
