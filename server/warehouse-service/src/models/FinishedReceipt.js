const mongoose = require("mongoose");

/**
 * FinishedReceipt - Phiếu nhập thành phẩm (sau QC đạt)
 */
const FinishedReceiptSchema = new mongoose.Schema({
 maPhieuNhapTP: { type: String, required: true, unique: true, index: true },
 phieuQC: { type: String }, // Lưu ID dạng string, không ref vì có thể là service khác
 sanPham: { type: String, required: true }, // Lưu ID dạng string, không ref vì là service khác
 soLuong: { type: Number, default: 0 },
 loSanXuat: String,
 ngaySanXuat: Date,
 hanSuDung: Date,
 nguoiLap: { type: String }, // Lưu ID dạng string, không ref vì là service khác
 ngayNhap: { type: Date, default: Date.now },
 ghiChu: String
}, { timestamps: true });

module.exports = mongoose.model("FinishedReceipt", FinishedReceiptSchema);