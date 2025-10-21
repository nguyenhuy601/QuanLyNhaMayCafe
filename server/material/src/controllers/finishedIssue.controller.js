const FinishedIssue = require("../models/FinishedIssue");

/** Lấy danh sách phiếu xuất thành phẩm */
exports.getAllFinishedIssues = async (req, res) => {
  try {
    const issues = await FinishedIssue.find()
      .populate("nguoiXuat khachHang danhSachXuat.sanPham")
      .sort({ ngayXuat: -1 });
    res.status(200).json(issues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Tạo phiếu xuất thành phẩm */
exports.createFinishedIssue = async (req, res) => {
  try {
    const issue = await FinishedIssue.create(req.body);
    res.status(201).json({ message: "Tạo phiếu xuất thành phẩm thành công", issue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
