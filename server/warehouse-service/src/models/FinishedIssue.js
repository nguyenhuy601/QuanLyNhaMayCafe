const mongoose = require("mongoose");
/**
 * FinishedIssue - Phiếu xuất thành phẩm (giao khách / điều chuyển)
 */
const FinishedIssueSchema = new mongoose.Schema({
 maPhieuXuatTP: { type: String, required: true, unique: true, index: true },
 ngayXuat: { type: Date, default: Date.now },
 donHang: { type: String }, // Lưu ID dạng string, không ref vì là service khác
 nguoiLap: { type: String }, // Lưu ID dạng string, không ref vì là service khác
 nguoiNhan: String,
 loaiXuat: { type: String, enum: ["GiaoKhachHang","DieuChuyen","Khac"], default: "GiaoKhachHang" },
 chiTiet: [
   { sanPham: { type: String }, soLuong: Number, donGia: Number, loXuat: String } // Lưu ID dạng string, không ref vì là service khác
 ],
 tongTien: Number,
 ghiChu: String,
 trangThai: { type: String, enum: ["Cho duyet","Cho xuat","Da xuat","Da giao","Tu choi"], default: "Cho duyet" }
}, { timestamps: true });

module.exports = mongoose.model("FinishedIssue", FinishedIssueSchema);
