const mongoose = require("mongoose");

/**
 * MaterialIssue - Phiếu xuất nguyên vật liệu cho xưởng
 */
const MaterialIssueSchema = new mongoose.Schema({
  maPhieuXuat: { type: String, required: true, unique: true, index: true },
  keHoach: { type: String }, // Lưu ID dạng string, không ref vì là service khác
  nguoiLap: { type: String }, // Lưu ID dạng string, không ref vì là service khác
  ngayXuat: { type: Date, default: Date.now },
  chiTiet: [
    { sanPham: { type: String }, soLuong: Number, loXuat: String } // Lưu ID dạng string, không ref vì là service khác
  ],
  xuongNhan: { type: String }, // Lưu ID dạng string, không ref vì là service khác
  // Trạng thái: 
  // - Cho xuat: chờ BGĐ duyệt
  // - Da xuat: BGĐ đã duyệt, đang gửi đến xưởng
  // - Da nhan: Xưởng trưởng đã xác nhận đã nhận NVL
  trangThai: { type: String, enum: ["Da xuat","Cho xuat","Da nhan","Tu choi"], default: "Cho xuat" }
}, { timestamps: true });

module.exports = mongoose.model("MaterialIssue", MaterialIssueSchema);