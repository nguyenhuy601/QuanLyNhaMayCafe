const Supplier = require("../models/Supplier");

/** Lấy danh sách NCC */
exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.status(200).json(suppliers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Thêm NCC mới */
exports.createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json({ message: "Thêm NCC thành công", supplier });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Cập nhật NCC */
exports.updateSupplier = async (req, res) => {
  try {
    const updated = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Không tìm thấy NCC" });
    res.status(200).json({ message: "Cập nhật thành công", supplier: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Xóa NCC */
exports.deleteSupplier = async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Xóa NCC thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
