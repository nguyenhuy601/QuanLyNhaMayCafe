const mongoose = require("mongoose");

/**
 * ProductionLog - Ghi nhận sản lượng theo ca/tổ
 */
const ProductionLogSchema = new mongoose.Schema({
  maBanGhi: { type: String, required: true, unique: true, index: true },
  keHoach: { type: mongoose.Schema.Types.ObjectId, ref: "ProductionPlan" },
  xuong: { type: mongoose.Schema.Types.ObjectId, ref: "Workshop" },
  to: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  ca: { type: mongoose.Schema.Types.ObjectId, ref: "WorkShift" },
  ngay: { type: Date, required: true },
  sanPham: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  soLuongThucTe: { type: Number, default: 0 },
  soLuongDat: { type: Number, default: 0 },
  soLuongLoi: { type: Number, default: 0 },
  chiTietLoi: [
    { defectCategory: { type: mongoose.Schema.Types.ObjectId, ref: "DefectCategory" }, soLuong: Number, ghiChu: String }
  ],
  nguoiGhi: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  ghiChu: String
}, { timestamps: true });

module.exports = mongoose.model("ProductionLog", ProductionLogSchema);