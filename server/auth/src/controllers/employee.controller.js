const Employee = require("../models/Employee");

/**
 * Lấy danh sách nhân viên
 */
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate("phongBan chucVu role")
      .sort({ createdAt: -1 });
    res.status(200).json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Tạo nhân viên mới
 */
exports.createEmployee = async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json({ message: "Thêm nhân viên thành công", employee });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Cập nhật thông tin nhân viên
 */
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Employee.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Không tìm thấy nhân viên" });
    res.status(200).json({ message: "Cập nhật thành công", employee: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Xóa nhân viên
 */
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    await Employee.findByIdAndDelete(id);
    res.status(200).json({ message: "Xóa nhân viên thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};