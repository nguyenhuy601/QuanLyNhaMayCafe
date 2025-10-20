const mongoose = require("mongoose");

/**
 * ProductionLog - Nhật ký/ghi nhận sản lượng trong mỗi ca/tổ
 * - Mỗi ca/ tổ sau khi sản xuất phải ghi số lượng thực tế, số lỗi, người chịu trách nhiệm
 */
const ProductionLogSchema = new mongoose.Schema({
  maBanGhi: { type: String, required: true, unique: true },
  keHoach: { type: mongoose.Schema.Types.ObjectId, ref: "ProductionPlan" },
  to: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  ca: { type: mongoose.Schema.Types.ObjectId, ref: "WorkShift" },
  ngay: { type: Date, required: true },
  sanPham: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  soLuongThucTe: Number,
  soLuongDat: Number,
  soLuongLoi: Number,
  chiTietLoi: [
    { defectCategory: { type: mongoose.Schema.Types.ObjectId, ref: "DefectCategory" }, soLuong: Number, ghiChu: String }
  ],
  nguoiGhi: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" }, // xưởng trưởng/tổ trưởng
  ghiChu: String
}, { timestamps: true });

module.exports = mongoose.model("ProductionLog", ProductionLogSchema);