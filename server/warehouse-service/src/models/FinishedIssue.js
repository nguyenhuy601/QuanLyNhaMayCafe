const mongoose = require("mongoose");
/**
 * FinishedIssue - Phiếu xuất thành phẩm (giao khách / điều chuyển)
 */
const FinishedIssueSchema = new mongoose.Schema({
 maPhieuXuatTP: { type: String, required: true, unique: true, index: true },
 ngayXuat: { type: Date, default: Date.now },
 donHang: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
 nguoiLap: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
 nguoiNhan: String,
 loaiXuat: { type: String, enum: ["GiaoKhachHang","DieuChuyen","Khac"], default: "GiaoKhachHang" },
 chiTiet: [
   { sanPham: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, soLuong: Number, donGia: Number, loXuat: String }
 ],
 tongTien: Number,
 ghiChu: String,
 trangThai: { type: String, enum: ["Cho xuat","Da xuat","Da giao"], default: "Da xuat" }
}, { timestamps: true });

module.exports = mongoose.model("FinishedIssue", FinishedIssueSchema);
