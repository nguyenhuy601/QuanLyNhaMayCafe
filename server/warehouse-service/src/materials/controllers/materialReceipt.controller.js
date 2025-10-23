const MaterialReceipt = require("../../models/PurchaseReceipt");

exports.getAllReceipts = async (req, res) => {
  try {
    const list = await MaterialReceipt.find().populate("nhaCungCap nguoiLap");
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createReceipt = async (req, res) => {
  try {
    const receipt = await MaterialReceipt.create(req.body);
    res.status(201).json({ message: "Đã tạo phiếu nhập NVL", receipt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
