const mongoose = require("mongoose");

/**
 * PurchaseReceipt - Phiếu nhập kho NVL (từ NCC)
 */
const PurchaseReceiptSchema = new mongoose.Schema({
  maPhieu: { type: String, required: true, unique: true },
  nhaCungCap: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
  nguoiLap: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  ngayNhap: { type: Date, default: Date.now },
  tongTien: Number,
  chungTu: String, // hóa đơn/chứng từ
  chiTiet: [
    {
      sanPham: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      soLuong: Number,
      donGia: Number,
      loNhap: String,
      hanSuDung: Date
    }
  ],
  trangThai: { type: String, enum: ["Da nhap","Cho nhap"], default: "Da nhap" }
}, { timestamps: true });

module.exports = mongoose.model("PurchaseReceipt", PurchaseReceiptSchema);