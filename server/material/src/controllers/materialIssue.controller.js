const MaterialIssue = require("../models/MaterialIssue");

/** Lấy danh sách phiếu xuất NVL */
exports.getAllIssues = async (req, res) => {
  try {
    const issues = await MaterialIssue.find()
      .populate("xuongNhan nguoiXuat danhSachXuat.sanPham")
      .sort({ ngayXuat: -1 });
    res.status(200).json(issues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Tạo phiếu xuất NVL */
exports.createIssue = async (req, res) => {
  try {
    const issue = await MaterialIssue.create(req.body);
    res.status(201).json({ message: "Tạo phiếu xuất thành công", issue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
