const Product = require("../models/Product");

/** 🟢 Lấy tất cả sản phẩm (có thể filter theo loại) */
exports.getAllProducts = async (req, res) => {
  try {
    const { loai } = req.query;
    const query = loai ? { loai: loai.toLowerCase() } : {};
    const products = await Product.find(query);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách sản phẩm", error: err.message });
  }
};

exports.getMaterials = async (req, res) => {
  try {
    const materials = await Product.find({ loai: "nguyenvatlieu" });
    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi tải nguyên vật liệu." });
  }
};

exports.getFinishedProducts = async (req, res) => {
  try {
    const products = await Product.find({ loai: "sanpham" });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi tải thành phẩm." });
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
    const productData = {
      ...req.body,
      loai: req.body.loai || "sanpham"
    };
    const newProduct = new Product(productData);
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

/** 🔵 Internal endpoint: Cập nhật số lượng tồn kho (cho warehouse-service) */
exports.updateProductQuantityInternal = async (req, res) => {
  try {
    const { id } = req.params;
    const { soLuong } = req.body;
    
    if (soLuong === undefined || soLuong === null) {
      return res.status(400).json({ message: "Thiếu thông tin số lượng" });
    }
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    
    // Cập nhật số lượng
    product.soLuong = Math.max(0, soLuong);
    await product.save();
    
    console.log(`✅ [sales-service] Updated product ${id} quantity to ${product.soLuong}`);
    res.json(product);
  } catch (err) {
    console.error(`❌ [sales-service] Error updating product quantity:`, err.message);
    res.status(400).json({ message: "Lỗi khi cập nhật số lượng sản phẩm", error: err.message });
  }
};