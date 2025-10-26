const mongoose = require("mongoose");

/**
 * MaterialIssue - Phiếu xuất nguyên vật liệu cho xưởng
 */
const MaterialIssueSchema = new mongoose.Schema({
  maPhieuXuat: { type: String, required: true, unique: true, index: true },
  keHoach: { type: mongoose.Schema.Types.ObjectId, ref: "ProductionPlan" },
  nguoiLap: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  ngayXuat: { type: Date, default: Date.now },
  chiTiet: [
    { sanPham: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, soLuong: Number, loXuat: String }
  ],
  xuongNhan: { type: mongoose.Schema.Types.ObjectId, ref: "Workshop" },
  trangThai: { type: String, enum: ["Da xuat","Cho xuat"], default: "Da xuat" }
}, { timestamps: true });

module.exports = mongoose.model("MaterialIssue", MaterialIssueSchema);