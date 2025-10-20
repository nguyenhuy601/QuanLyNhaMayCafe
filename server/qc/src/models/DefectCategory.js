const mongoose = require("mongoose");

/**
 * DefectCategory - Danh mục phân loại lỗi sản phẩm (theo báo cáo cần ghi rõ nguyên nhân lỗi)
 */
const DefectCategorySchema = new mongoose.Schema({
  maLoi: { type: String, required: true, unique: true },
  tenLoi: { type: String, required: true }, // ví dụ: Lỗi kích thước, Lỗi màu sắc, Lỗi mùi
  moTa: String,
  hanhDong: String // ví dụ: "Chuyen lai xuong", "Tieu huy"
}, { timestamps: true });

module.exports = mongoose.model("DefectCategory", DefectCategorySchema);