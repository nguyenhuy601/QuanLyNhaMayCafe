const Category = require("../models/Category");

/** Lấy danh sách loại sản phẩm / nguyên vật liệu */
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Tạo loại mới */
exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ message: "Thêm loại thành công", category });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Cập nhật loại */
exports.updateCategory = async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Không tìm thấy loại" });
    res.status(200).json({ message: "Cập nhật thành công", category: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Xóa loại */
exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Xóa loại thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
