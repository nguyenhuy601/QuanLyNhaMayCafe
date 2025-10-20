const mongoose = require("mongoose");

/**
 * QCRequest - Phiếu yêu cầu kiểm tra thành phẩm (do xưởng trưởng tạo)
 */
const QCRequestSchema = new mongoose.Schema({
  maPhieuQC: { type: String, required: true, unique: true },
  keHoach: { type: mongoose.Schema.Types.ObjectId, ref: "ProductionPlan" },
  sanPham: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  loSanXuat: String,
  soLuong: Number,
  xuong: String,
  ngayYeuCau: { type: Date, default: Date.now },
  nguoiYeuCau: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" }, // xưởng trưởng
  trangThai: { type: String, enum: ["Cho kiem tra","Da kiem tra"], default: "Cho kiem tra" },
  ghiChu: String
}, { timestamps: true });

module.exports = mongoose.model("QCRequest", QCRequestSchema);