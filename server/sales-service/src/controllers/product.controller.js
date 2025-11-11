const Product = require("../models/Product");

/** 🟢 Lấy tất cả sản phẩm */
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách sản phẩm", error: err.message });
  }
};

/** 🟢 Lấy 1 sản phẩm theo ID hoặc mã sản phẩm */
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id) || await Product.findOne({ maSP: id });
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy thông tin sản phẩm", error: err.message });
  }
};

/** 🟢 Tạo sản phẩm mới */
exports.createProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: "Lỗi khi tạo sản phẩm", error: err.message });
  }
};

/** 🟢 Cập nhật sản phẩm */
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedProduct) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: "Lỗi khi cập nhật sản phẩm", error: err.message });
  }
};

/** 🟢 Xóa sản phẩm */
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    res.json({ message: "Đã xóa sản phẩm thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi xóa sản phẩm", error: err.message });
  }
};
