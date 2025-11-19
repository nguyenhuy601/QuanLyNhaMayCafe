import { CheckCircle2 } from "lucide-react";

const ConfirmSuccessModal = ({ onClose, xuong }) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 border-4 border-red-500">
      {/* Hộp modal */}
      <div className="bg-[#fffdfb] p-8 rounded-xl shadow-xl border border-[#e5d2b2] w-[420px] text-center relative animate-fadeIn">
        
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[#8b4513] hover:text-[#b86b36] text-2xl transition"
        >
          ×
        </button>

        {/* Icon thành công */}
        <div className="flex justify-center mb-4">
          <CheckCircle2 size={60} className="text-[#4a9b5b]" />
        </div>

        {/* Nội dung */}
        <h3 className="text-xl font-bold text-[#5a2e0f] mb-2">
          Kiểm định thành công!
        </h3>
        <p className="text-[#3e2a15] mb-6">
          Dữ liệu của <span className="font-semibold text-[#8b4513]">{xuong}</span> đã được cập nhật.
        </p>

        {/* Nút xác nhận */}
        <button
          onClick={onClose}
          className="bg-[#8b4513] hover:bg-[#a0522d] text-white px-6 py-2.5 rounded-md shadow-md transition-all duration-200 hover:shadow-lg"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};
export default ConfirmSuccessModal;