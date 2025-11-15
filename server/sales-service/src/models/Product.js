const mongoose = require("mongoose");

/**
 * Minimal Product model schema for sales-service to enable populate on Order.chiTiet.sanPham
 * Core product data is managed by production-plan-service
 */
const ProductSchema = new mongoose.Schema({
  maSP: { type: String, required: true, unique: true },
  tenSP: String,
  moTa: String,
  donViTinh: String,
  donGia: Number,
  loai: {
    type: String,
    enum: ["sanpham", "nguyenvatlieu"],
    default: "sanpham",
    description: "Loại: sanpham (sản phẩm) hoặc nguyenvatlieu (nguyên vật liệu)"
  },
  trangThai: { type: String, enum: ["Active", "Inactive"], default: "Active" }
}, { timestamps: true });

module.exports = mongoose.model("Product", ProductSchema);