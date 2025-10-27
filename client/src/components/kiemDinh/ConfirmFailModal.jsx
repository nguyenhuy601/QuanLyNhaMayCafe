import { XCircle } from "lucide-react";

const ConfirmFailModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      {/* Hộp modal */}
      <div className="bg-[#fffdfb] p-8 rounded-xl shadow-xl border border-[#e5d2b2] w-[420px] text-center relative animate-fadeIn">
        
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[#8b4513] hover:text-[#b86b36] text-2xl transition"
        >
          ×
        </button>

        {/* Icon thất bại */}
        <div className="flex justify-center mb-4">
          <XCircle size={60} className="text-[#c54b3a]" />
        </div>

        {/* Nội dung */}
        <h3 className="text-xl font-bold text-[#5a2e0f] mb-2">
          Kiểm định không đạt!
        </h3>
        <p className="text-[#3e2a15] mb-6">
          Lô sản phẩm tại <span className="font-semibold text-[#8b4513]">Xưởng Chế biến - C1</span>{" "}
          chưa đạt yêu cầu. Vui lòng xem lại ghi chú và xử lý.
        </p>

        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="bg-[#c54b3a] hover:bg-[#a13b2c] text-white px-6 py-2.5 rounded-md shadow-md transition-all duration-200 hover:shadow-lg"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};

export default ConfirmFailModal;
