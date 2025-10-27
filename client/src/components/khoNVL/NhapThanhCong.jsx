const NhapThanhCong = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-[#fffdfb] p-6 rounded-lg border-4 border-[#8b4513] text-center relative animate-fadeIn">
        <button onClick={onClose} className="absolute top-2 right-3 text-xl text-[#8b4513]">×</button>
        <p className="text-lg font-semibold text-[#5a2e0f]">
          Lưu phiếu Nhập kho thành công!
        </p>
      </div>
    </div>
  );
};

export default NhapThanhCong;
