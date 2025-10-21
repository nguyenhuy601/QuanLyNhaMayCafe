const Employee = require("../models/Employee");

/** Danh sách nhân viên */
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().populate("chucVu phongBan").sort({ hoTen: 1 });
    res.status(200).json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Tạo nhân viên */
exports.createEmployee = async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json({ message: "Thêm nhân viên thành công", employee });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Cập nhật thông tin nhân viên */
exports.updateEmployee = async (req, res) => {
  try {
    const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "Cập nhật nhân viên thành công", employee: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
