const mongoose = require("mongoose");

/**
 * FinishedReceipt - Phiếu nhập thành phẩm (sau QC đạt)
 */
const FinishedReceiptSchema = new mongoose.Schema({
 maPhieuNhapTP: { type: String, required: true, unique: true, index: true },
 phieuQC: { type: mongoose.Schema.Types.ObjectId, ref: "QCRequest" },
 sanPham: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
 soLuong: { type: Number, default: 0 },
 loSanXuat: String,
 ngaySanXuat: Date,
 hanSuDung: Date,
 nguoiLap: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
 ngayNhap: { type: Date, default: Date.now },
 ghiChu: String
}, { timestamps: true });

module.exports = mongoose.model("FinishedReceipt", FinishedReceiptSchema);