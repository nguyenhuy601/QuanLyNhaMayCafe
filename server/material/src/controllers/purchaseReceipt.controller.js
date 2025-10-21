const PurchaseReceipt = require("../models/PurchaseReceipt");

/** Lấy danh sách phiếu nhập NVL */
exports.getAllPurchaseReceipts = async (req, res) => {
  try {
    const receipts = await PurchaseReceipt.find()
      .populate("nhaCungCap nguoiTao danhSachVatTu.sanPham")
      .sort({ ngayNhap: -1 });
    res.status(200).json(receipts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Tạo phiếu nhập NVL */
exports.createPurchaseReceipt = async (req, res) => {
  try {
    const receipt = await PurchaseReceipt.create(req.body);
    res.status(201).json({ message: "Tạo phiếu nhập thành công", receipt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Cập nhật phiếu nhập */
exports.updatePurchaseReceipt = async (req, res) => {
  try {
    const updated = await PurchaseReceipt.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "Cập nhật phiếu nhập thành công", receipt: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
