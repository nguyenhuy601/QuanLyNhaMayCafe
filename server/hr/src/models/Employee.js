const mongoose = require("mongoose");

/**
 * Employee - Nhân viên
 */
const EmployeeSchema = new mongoose.Schema({
  maNV: { type: String, required: true, unique: true, index: true },
  hoTen: { type: String, required: true },
  gioiTinh: { type: String, enum: ["Nam","Nu","Khac"], default: "Khac" },
  ngaySinh: Date,
  diaChi: String,
  sdt: String,
  email: String,
  ngayVaoLam: Date,
  phongBan: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  chucVu: { type: mongoose.Schema.Types.ObjectId, ref: "Position" },
  role: { type: mongoose.Schema.Types.ObjectId, ref: "Role" },
  luongCoBan: Number,
  trangThai: { type: String, default: "Dang lam" } // 'Dang lam', 'Da nghi', ...
}, { timestamps: true });

module.exports = mongoose.model("Employee", EmployeeSchema);