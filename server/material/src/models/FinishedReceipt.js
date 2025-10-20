const mongoose = require("mongoose");

/**
 * FinishedReceipt - Phiếu nhập kho thành phẩm (sau QC đạt)
 */
const FinishedReceiptSchema = new mongoose.Schema({
  maPhieuNhapTP: { type: String, required: true, unique: true },
  phieuQC: { type: mongoose.Schema.Types.ObjectId, ref: "QCRequest" },
  sanPham: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  soLuong: Number,
  loSanXuat: String,
  ngaySanXuat: Date,
  hanSuDung: Date,
  kho: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse" },
  nguoiLap: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  ngayNhap: { type: Date, default: Date.now },
  ghiChu: String
}, { timestamps: true });

module.exports = mongoose.model("FinishedReceipt", FinishedReceiptSchema);