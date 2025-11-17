const mongoose = require("mongoose");
require("./QCDefectCategory");

const QCResultSchema = new mongoose.Schema({
  qcRequest: { type: mongoose.Schema.Types.ObjectId, ref: "QCRequest", required: true },
  ngayKiemTra: { type: Date, default: Date.now },
  nguoiKiemTra: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  ketQuaChung: { type: String, enum: ["Chua kiem tra","Dat","Khong dat"], default: "Chua kiem tra" },
  chiTietTieuChi: [
    {
      tieuChi: String,
      giaTriThamChieu: String,
      giaTriDo: String,
      ketQua: { type: String, enum: ["Dat","Khong dat"] },
      ghiChu: String
    }
  ],
  phanLoaiLoi: [{ type: mongoose.Schema.Types.ObjectId, ref: "QCDefectCategory" }],
  soLuongLoi: { type: Number, default: 0 },
  soLuongDat: { type: Number, default: 0 },
  ghiChu: String
}, { timestamps: true });

module.exports = mongoose.model("QCResult", QCResultSchema);
