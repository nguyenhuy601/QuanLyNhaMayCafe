import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle } from "lucide-react";

import ConfirmSuccessModal from "../components/ConfirmSuccessModal.jsx";
import ConfirmExitModal from "../components/ConfirmExitModal.jsx";
import NoteModal from "../components/noteModal.jsx";

import { getQcRequestById, postQcResult, updateQcRequest } from "../../../services/qcService";
import useRealtime from "../../../hooks/useRealtime";

const KiemDinhDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [ketQua, setKetQua] = useState("Đạt");
  const [soLuongDat, setSoLuongDat] = useState("");
  const [soLuongLoi, setSoLuongLoi] = useState("");
  const [ghiChu, setGhiChu] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const fetchRequest = useCallback(async () => {
    try {
      const data = await getQcRequestById(id);
      setRequest(data);

      // Nếu đã có dữ liệu kiểm định trước đó
      if (data.soLuongDat !== undefined && data.soLuongDat !== null && data.soLuongDat !== 0) {
        setSoLuongDat(data.soLuongDat);
      }
      if (data.soLuongLoi !== undefined && data.soLuongLoi !== null && data.soLuongLoi !== 0) {
        setSoLuongLoi(data.soLuongLoi);
      }
      if (data.ghiChu) setGhiChu(data.ghiChu);
    } catch (err) {
    }
  }, [id]);

  useEffect(() => {
    fetchRequest();
  }, [fetchRequest]);

  // Realtime updates - chỉ refresh khi có thay đổi từ bên ngoài
  useRealtime({
    eventHandlers: {
      QC_REQUEST_UPDATED: fetchRequest,
      QC_RESULT_CREATED: fetchRequest,
      qc_events: fetchRequest, // Generic QC events
    },
  });

  const handleConfirm = async () => {
    try {
      const payload = {
        qcRequest: id,
        ketQuaChung: ketQua === "Đạt" ? "Dat" : "Khong dat",
        soLuongDat: soLuongDat === "" || soLuongDat === null ? 0 : Number(soLuongDat),
        soLuongLoi: soLuongLoi === "" || soLuongLoi === null ? 0 : Number(soLuongLoi),
        chiTietTieuChi: [],
        phanLoaiLoi: [],
        nguoiKiemTra: "60f7a7b2c9a1f2a5c4e6b3d9",
        ghiChu: ghiChu || "",
      };

      // Gửi kết quả kiểm định
      await postQcResult(payload);

      // Cập nhật trạng thái phiếu QC
      updateQcRequest(id, { trangThai: "Đã kiểm định", ghiChu: ghiChu || "" })
        .catch(() => {});

      // Hiện modal thành công
      setShowSuccess(true);

      // Redirect sau 2 giây
      setTimeout(() => navigate("/qc/danh-sach"), 2000);

    } catch (err) {
    }
  };

  const handleConfirmWithNote = async (note) => {
    setGhiChu(note || "");
    setShowNote(false);
    await handleConfirm();
  };

  const handleExitConfirm = () => {
    setShowExitConfirm(false);
    navigate("/qc/danh-sach");
  };

  if (!request) return <p className="text-center mt-10 text-gray-600">Đang tải dữ liệu...</p>;

  return (
    <div className="p-6 bg-[#fffdfb] rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8 text-[#5a2e0f] tracking-wide">
        CẬP NHẬT KẾT QUẢ KIỂM ĐỊNH
      </h2>

      <form className="flex flex-col gap-5 text-[#3e2a15] text-lg">
        <div>
          <label className="block font-semibold mb-1">Mã phiếu QC:</label>
          <input value={request.maPhieuQC || ""} readOnly className="border border-[#e5d2b2] bg-[#fdf8f4] rounded-md px-3 py-2 w-full" />
        </div>

        <div>
          <label className="block font-semibold mb-1">Sản phẩm:</label>
          <input
            value={
              request.sanPham?.ProductName ||
              request.sanPhamName ||
              ""
            }
            readOnly
            className="border border-[#e5d2b2] bg-[#fdf8f4] rounded-md px-3 py-2 w-full"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Xưởng:</label>
          <input value={request.xuong || ""} readOnly className="border border-[#e5d2b2] bg-[#fdf8f4] rounded-md px-3 py-2 w-full" />
        </div>

        <div>
          <label className="block font-semibold mb-1">Số lượng:</label>
          <input value={request.soLuong || ""} readOnly className="border border-[#e5d2b2] bg-[#fdf8f4] rounded-md px-3 py-2 w-full" />
        </div>

        <div>
          <label className="block font-semibold mb-1">Số lượng đạt:</label>
          <input 
            type="number" 
            value={soLuongDat === 0 ? "" : soLuongDat} 
            onChange={(e) => {
              const val = e.target.value;
              setSoLuongDat(val === "" ? "" : Number(val));
            }} 
            className="border border-[#e5d2b2] rounded-md px-3 py-2 w-full" 
            placeholder="Nhập số lượng đạt"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Số lượng lỗi:</label>
          <input 
            type="number" 
            value={soLuongLoi === 0 ? "" : soLuongLoi} 
            onChange={(e) => {
              const val = e.target.value;
              setSoLuongLoi(val === "" ? "" : Number(val));
            }} 
            className="border border-[#e5d2b2] rounded-md px-3 py-2 w-full" 
            placeholder="Nhập số lượng lỗi"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Kết quả kiểm định:</label>
          <select className={`border border-[#e5d2b2] rounded-md px-3 py-2 w-full ${ketQua === "Đạt" ? "text-green-600" : "text-red-600"}`} value={ketQua} onChange={(e) => {
            setKetQua(e.target.value);
            if (e.target.value === "Không đạt") setShowNote(true);
          }}>
            <option value="Đạt">Đạt</option>
            <option value="Không đạt">Không đạt</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">Ghi chú:</label>
          <textarea value={ghiChu} readOnly className="border border-[#e5d2b2] bg-[#fdf8f4] rounded-md px-3 py-2 w-full resize-none" />
        </div>

        <div className="flex justify-center mt-6 gap-4">
          <button type="button" onClick={() => setShowExitConfirm(true)} className="flex items-center gap-2 bg-[#c54b3a] hover:bg-[#a13b2c] text-white px-5 py-2.5 rounded-md">
            <XCircle size={18} />
            <span>Hủy kiểm định</span>
          </button>

          <button type="button" onClick={handleConfirm} className="flex items-center gap-2 bg-[#4a9b5b] hover:bg-[#3a8148] text-white px-5 py-2.5 rounded-md">
            <CheckCircle size={18} />
            <span>Xác nhận kết quả</span>
          </button>
        </div>
      </form>

      {showSuccess && <ConfirmSuccessModal onClose={() => setShowSuccess(false)} xuong={request.xuong} />}
      {showNote && <NoteModal onClose={() => setShowNote(false)} note={ghiChu} setNote={setGhiChu} onConfirm={handleConfirmWithNote} />}
      {showExitConfirm && <ConfirmExitModal onClose={() => setShowExitConfirm(false)} onConfirm={handleExitConfirm} />}
    </div>
  );
};

export default KiemDinhDetail;
