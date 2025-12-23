const mongoose = require("mongoose");

/**
 * PurchaseReceipt - Phiếu nhập nguyên vật liệu từ NCC
 */
const PurchaseReceiptSchema = new mongoose.Schema({
 maPhieu: { type: String, required: true, unique: true, index: true },
 keHoach: { type: String }, // Lưu ID dạng string, không ref vì là service khác
 nhaCungCap: { type: String }, // Lưu ID dạng string, không ref vì là service khác
 nguoiLap: { type: String }, // Lưu ID dạng string, không ref vì là service khác
 ngayNhap: { type: Date, default: Date.now },
 tongTien: Number,
 chungTu: String,
 ghiChu: String, // Thêm field ghiChu
 chiTiet: [
   {
     sanPham: { type: String }, // Lưu ID dạng string, không ref vì là service khác
     soLuong: Number,
     loNhap: String,
     hanSuDung: Date
   }
 ],
 trangThai: { type: String, enum: ["Da nhap","Cho nhap","Tu choi"], default: "Cho nhap" }
}, { timestamps: true });

module.exports = mongoose.model("PurchaseReceipt", PurchaseReceiptSchema);