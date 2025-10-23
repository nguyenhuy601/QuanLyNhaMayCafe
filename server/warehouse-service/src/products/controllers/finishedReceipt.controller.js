const FinishedReceipt = require("../../models/FinishedReceipt");

exports.getAllFinishedReceipts = async (req, res) => {
  try {
    const list = await FinishedReceipt.find().populate("nguoiLap logQC");
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
