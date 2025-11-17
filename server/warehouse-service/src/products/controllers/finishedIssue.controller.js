const FinishedIssue = require("../../models/FinishedIssue");
const { publishEvent } = require("../../utils/eventPublisher");


exports.getAllFinishedIssues = async (req, res) => {
  try {
    const list = await FinishedIssue.find().populate("nguoiLap khachHang donHang");
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
/*
exports.createFinishedIssue = async (req, res) => {
  try {
    const issue = await FinishedIssue.create({
      ...req.body,
      ngayXuat: new Date(),
      trangThai: "Đã xuất kho",
    });

    // Gửi event sang Sales-Service để cập nhật trạng thái đơn
    await publishEvent("FINISHED_ISSUE", issue);
    res.status(201).json({ message: "Xuất thành phẩm thành công", issue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; */

exports.createFinishedIssue = async (req, res) => {
  try {
    const { trangThai, ...bodyWithoutTrangThai } = req.body;

    console.log("req.body:", req.body);
    console.log("bodyWithoutTrangThai:", bodyWithoutTrangThai);

    const issue = await FinishedIssue.create({
      ...bodyWithoutTrangThai,
      ngayXuat: new Date(),
      trangThai: "Da xuat",
    });

    await publishEvent("FINISHED_ISSUE", issue);
    res.status(201).json({ message: "Xuất thành phẩm thành công", issue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


