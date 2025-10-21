const WorkAssignment = require("../models/WorkAssignment");

/** Lấy danh sách phân công công việc */
exports.getAllAssignments = async (req, res) => {
  try {
    const assignments = await WorkAssignment.find()
      .populate("xuong to nguoiPhanCong danhSachCongViec.sanPham")
      .sort({ createdAt: -1 });
    res.status(200).json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Tạo phân công mới */
exports.createAssignment = async (req, res) => {
  try {
    const assignment = await WorkAssignment.create(req.body);
    res.status(201).json({ message: "Phân công thành công", assignment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
