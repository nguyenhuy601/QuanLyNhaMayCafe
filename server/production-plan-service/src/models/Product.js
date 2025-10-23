const mongoose = require("mongoose");

/**
 * Product - sản phẩm hoặc nguyên vật liệu
 * - có thể là NVL (raw material) hoặc thành phẩm
 * - quản lý theo lô và hạn sử dụng
 */
const ProductSchema = new mongoose.Schema({
  maSP: { type: String, required: true, unique: true },
  tenSP: { type: String, required: true },
  loaiSP: { type: mongoose.Schema.Types.ObjectId, ref: "Category" }, // phân loại
  donViTinh: String,
  donGia: Number,
  isRawMaterial: { type: Boolean, default: false }, // NVL hay thành phẩm
  thongTinLo: [
    {
      lo: String,
      ngaySanXuat: Date,
      hanSuDung: Date,
      soLuong: Number
    }
  ],
  soLuongTon: { type: Number, default: 0 },
  trangThai: { type: String, default: "Hoạt động" },
  moTa: String
}, { timestamps: true });

module.exports = mongoose.model("Product", ProductSchema);