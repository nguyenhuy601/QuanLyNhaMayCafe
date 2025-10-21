const Customer = require("../models/Customer");

/** Lấy danh sách khách hàng */
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.status(200).json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Tạo khách hàng mới */
exports.createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json({ message: "Thêm khách hàng thành công", customer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Cập nhật thông tin khách hàng */
exports.updateCustomer = async (req, res) => {
  try {
    const updated = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    res.status(200).json({ message: "Cập nhật thành công", customer: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Xóa khách hàng */
exports.deleteCustomer = async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Xóa khách hàng thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
