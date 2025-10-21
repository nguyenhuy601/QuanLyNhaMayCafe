const FinishedReceipt = require("../models/FinishedReceipt");

/** Lấy danh sách phiếu nhập thành phẩm */
exports.getAllFinishedReceipts = async (req, res) => {
  try {
    const receipts = await FinishedReceipt.find()
      .populate("nguoiTao danhSachThanhPham.sanPham")
      .sort({ ngayNhap: -1 });
    res.status(200).json(receipts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Tạo phiếu nhập thành phẩm */
exports.createFinishedReceipt = async (req, res) => {
  try {
    const receipt = await FinishedReceipt.create(req.body);
    res.status(201).json({ message: "Tạo phiếu nhập thành phẩm thành công", receipt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
