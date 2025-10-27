const QCRequest = require("../models/QCRequest");

exports.getAllRequests = async (req, res) => {
  try {
    const list = await QCRequest.find()
      .populate("nguoiYeuCau logSanXuat")
      .sort({ ngayYeuCau: -1 });
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const updated = await QCRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "Cập nhật phiếu yêu cầu thành công", updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
