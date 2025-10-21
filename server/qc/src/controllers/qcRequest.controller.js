const QCRequest = require("../models/QCRequest");

/** Lấy danh sách phiếu yêu cầu kiểm tra */
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await QCRequest.find()
      .populate("nguoiTao sanPham xuong to")
      .sort({ ngayYeuCau: -1 });
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Tạo phiếu yêu cầu kiểm tra (sau khi xưởng báo hoàn thành) */
exports.createRequest = async (req, res) => {
  try {
    const request = await QCRequest.create(req.body);
    res.status(201).json({ message: "Tạo phiếu yêu cầu QC thành công", request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
