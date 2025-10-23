const mongoose = require("mongoose");

/**
 * Customer - Khách hàng
 */
const CustomerSchema = new mongoose.Schema({
  maKH: { type: String, required: true, unique: true },
  tenKH: { type: String, required: true },
  sdt: String,
  email: String,
  diaChi: String,
  loaiKH: { type: String, enum: ["Cá nhân","Doanh nghiệp"], default: "Cá nhân" },
  ghiChu: String
}, { timestamps: true });

module.exports = mongoose.model("Customer", CustomerSchema);