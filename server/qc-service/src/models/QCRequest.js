const mongoose = require("mongoose");

const QCRequestSchema = new mongoose.Schema({
  maPhieuQC: { type: String, required: true, unique: true },
  keHoach: { type: mongoose.Schema.Types.ObjectId, ref: "ProductionPlan" },
  sanPham: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  loSanXuat: String,
  soLuong: Number,
  xuong: String,
  ngayYeuCau: { type: Date, default: Date.now },
  nguoiYeuCau: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  trangThai: { type: String, enum: ["Chưa kiểm định","Đã kiểm định"], default: "Chưa kiểm định" },
  ghiChu: String
}, { timestamps: true });

module.exports = mongoose.model("QCRequest", QCRequestSchema);
