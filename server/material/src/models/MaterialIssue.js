const mongoose = require("mongoose");

/**
 * MaterialIssue - Phiếu xuất kho NVL cho xưởng/keHoach
 */
const MaterialIssueSchema = new mongoose.Schema({
  maPhieuXuat: { type: String, required: true, unique: true },
  keHoach: { type: mongoose.Schema.Types.ObjectId, ref: "ProductionPlan" },
  kho: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse" },
  nguoiLap: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  ngayXuat: { type: Date, default: Date.now },
  chiTiet: [
    { sanPham: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, soLuong: Number, loXuat: String }
  ],
  xuongNhan: String,
  trangThai: { type: String, enum: ["Da xuat","Cho xuat"], default: "Da xuat" }
}, { timestamps: true });

module.exports = mongoose.model("MaterialIssue", MaterialIssueSchema);