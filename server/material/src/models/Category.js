const mongoose = require("mongoose");

/**
 * Category - Loại sản phẩm / nguyên vật liệu
 */
const CategorySchema = new mongoose.Schema({
  maLoai: { type: String, required: true, unique: true },
  tenLoai: { type: String, required: true },
  moTa: String
}, { timestamps: true });

module.exports = mongoose.model("Category", CategorySchema);