import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ConfirmExitModal = ({ onClose }) => {
  const navigate = useNavigate();

  const handleExit = () => {
    onClose();
    navigate("/qc/danh-sach");
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-[#fffdfb] p-8 rounded-xl shadow-xl border border-[#e5d2b2] w-[420px] text-center relative animate-fadeIn">
        
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[#8b4513] hover:text-[#b86b36] text-2xl transition"
        >
          ×
        </button>

        {/* Icon cảnh báo */}
        <div className="flex justify-center mb-4">
          <AlertTriangle size={60} className="text-[#d97706]" />
        </div>

        {/* Nội dung */}
        <h3 className="text-xl font-bold text-[#5a2e0f] mb-3">
          Xác nhận thoát?
        </h3>
        <p className="text-[#3e2a15] mb-6">
          Bạn có chắc chắn muốn{" "}
          <span className="font-semibold text-[#8b4513]">hủy kiểm định</span> này không?
        </p>

        {/* Nút hành động */}
        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            className="bg-[#a0522d] hover:bg-[#8b4513] text-white px-5 py-2.5 rounded-md shadow-md transition-all duration-200 hover:shadow-lg"
          >
            Quay lại
          </button>
          <button
            onClick={handleExit}
            className="bg-[#c54b3a] hover:bg-[#a13b2c] text-white px-5 py-2.5 rounded-md shadow-md transition-all duration-200 hover:shadow-lg"
          >
            Thoát
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmExitModal;
