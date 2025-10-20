const mongoose = require("mongoose");

/**
 * QCResult - Kết quả kiểm định chi tiết cho một QCRequest
 * - Mỗi QCRequest có thể có 1 hoặc nhiều QCResult (nếu kiểm tra theo tiêu chí)
 */
const QCResultSchema = new mongoose.Schema({
  qcRequest: { type: mongoose.Schema.Types.ObjectId, ref: "QCRequest", required: true },
  ngayKiemTra: { type: Date, default: Date.now },
  nguoiKiemTra: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  ketQuaChung: { type: String, enum: ["Chua kiem tra","Dat","Khong dat"], default: "Chua kiem tra" },
  chiTietTieuChi: [
    {
      tieuChi: String, // ví dụ: kích thước, màu sắc, hương vị, độ ẩm
      giaTriThamChieu: String,
      giaTriDo: String,
      ketQua: { type: String, enum: ["Dat","Khong dat"] },
      ghiChu: String
    }
  ],
  phanLoaiLoi: [{ type: mongoose.Schema.Types.ObjectId, ref: "DefectCategory" }], // nếu có lỗi
  ghiChu: String
}, { timestamps: true });

module.exports = mongoose.model("QCResult", QCResultSchema);