const Product = require("../models/Product");

/** Lấy danh sách sản phẩm / nguyên vật liệu */
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("loaiSanPham").sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Tạo sản phẩm mới */
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ message: "Thêm sản phẩm thành công", product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Cập nhật sản phẩm */
exports.updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    res.status(200).json({ message: "Cập nhật thành công", product: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Xóa sản phẩm */
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Xóa sản phẩm thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
