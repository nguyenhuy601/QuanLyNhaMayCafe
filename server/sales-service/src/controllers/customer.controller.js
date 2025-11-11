const Customer = require("../models/Customer");

// 🔍 Tìm khách hàng theo số điện thoại
exports.findCustomerByPhone = async (req, res) => {
  try {
    const phone = req.params.phone;

    if (!phone || phone.trim().length < 8) {
      return res.status(400).json({ message: "Số điện thoại không hợp lệ" });
    }

    const customer = await Customer.findOne({ sdt: phone }).lean();
    if (!customer) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    }

    return res.status(200).json(customer);
  } catch (err) {
    console.error("❌ Error in findCustomerByPhone:", err);
    return res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Lấy danh sách khách hàng
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách khách hàng" });
  }
};

// Tạo khách hàng
exports.createCustomer = async (req, res) => {
  try {
    const newCustomer = new Customer(req.body);
    await newCustomer.save();
    res.status(201).json(newCustomer);
  } catch (err) {
    res.status(400).json({ message: "Lỗi khi tạo khách hàng", error: err.message });
  }
};

// Cập nhật khách hàng
exports.updateCustomer = async (req, res) => {
  try {
    const updated = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Lỗi khi cập nhật khách hàng", error: err.message });
  }
};

// Xóa khách hàng
exports.deleteCustomer = async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: "Xóa khách hàng thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi xóa khách hàng", error: err.message });
  }
};
