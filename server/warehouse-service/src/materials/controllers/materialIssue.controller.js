const MaterialIssue = require("../../models/MaterialIssue");

exports.getAllIssues = async (req, res) => {
  try {
    const list = await MaterialIssue.find().populate("nguoiLap keHoach xuatChoXuong");
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createIssue = async (req, res) => {
  try {
    const issue = await MaterialIssue.create({
      ...req.body,
      ngayXuat: new Date(),
      trangThai: "Đã xuất kho",
    });
    res.status(201).json({ message: "Xuất NVL thành công", issue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
