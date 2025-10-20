const mongoose = require("mongoose");

/**
 * PaymentVoucher - Phiếu chi (thanh toán nhà cung cấp,...)
 */
const PaymentVoucherSchema = new mongoose.Schema({
  maPhieu: { type: String, required: true, unique: true },
  loai: { type: String, enum: ["Chi NCC","Chi Noi Bo"], required: true },
  doiTuong: String, // nhà cung cấp hoặc nội bộ
  soTien: Number,
  ngayLap: { type: Date, default: Date.now },
  nguoiLap: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  chungTu: String,
  ghiChu: String
}, { timestamps: true });

module.exports = mongoose.model("PaymentVoucher", PaymentVoucherSchema);