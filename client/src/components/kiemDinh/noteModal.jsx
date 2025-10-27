import { useState } from "react";
import { XCircle, FileText } from "lucide-react";

const NoteModal = ({ onClose }) => {
  const [note, setNote] = useState("");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      {/* Khung modal */}
      <div className="bg-[#fffdfb] p-6 rounded-xl shadow-xl border border-[#e5d2b2] w-[420px] relative animate-fadeIn">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[#8b4513] hover:text-[#b86b36] text-2xl transition"
        >
          ×
        </button>

        {/* Tiêu đề */}
        <div className="flex flex-col items-center mb-4">
          <FileText size={36} className="text-[#8b4513] mb-2" />
          <h3 className="text-lg font-bold text-[#5a2e0f] text-center">
            Ghi chú cho lô sản phẩm <br /> <span className="text-[#c54b3a]">Không đạt kiểm định</span>
          </h3>
        </div>

        {/* Textarea */}
        <textarea
          placeholder="Nhập ghi chú chi tiết, ví dụ: Bao bì sản phẩm lỗi, yêu cầu trả về xưởng khắc phục..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full h-28 border border-[#e5d2b2] rounded-md p-3 text-sm text-[#3e2a15] focus:outline-none focus:ring-2 focus:ring-[#a0522d] bg-[#fdf8f4] resize-none"
        />

        {/* Nút hành động */}
        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex items-center gap-2 bg-[#c54b3a] hover:bg-[#a13b2c] text-white px-5 py-2 rounded-md shadow-md transition-all duration-200 hover:shadow-lg"
          >
            <XCircle size={18} />
            <span>Hủy</span>
          </button>
          <button
            onClick={() => {
              console.log("Ghi chú:", note);
              onClose();
            }}
            className="flex items-center gap-2 bg-[#4a9b5b] hover:bg-[#3a8148] text-white px-5 py-2 rounded-md shadow-md transition-all duration-200 hover:shadow-lg"
          >
            <FileText size={18} />
            <span>Xác nhận</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteModal;
