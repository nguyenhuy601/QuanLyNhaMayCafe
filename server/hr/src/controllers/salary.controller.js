const Salary = require("../models/Salary");

/** Danh sách bảng lương */
exports.getAllSalaries = async (req, res) => {
  try {
    const salaries = await Salary.find()
      .populate("nhanVien nguoiLap")
      .sort({ thang: -1 });
    res.status(200).json(salaries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Tạo bảng lương mới */
exports.createSalary = async (req, res) => {
  try {
    const salary = await Salary.create(req.body);
    res.status(201).json({ message: "Tạo bảng lương thành công", salary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
