const MaterialRequest = require("../models/MaterialRequest");

/** Lấy danh sách yêu cầu NVL */
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await MaterialRequest.find()
      .populate("xuongNhan nguoiYeuCau danhSachYeuCau.sanPham")
      .sort({ ngayYeuCau: -1 });
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Tạo phiếu yêu cầu NVL */
exports.createRequest = async (req, res) => {
  try {
    const request = await MaterialRequest.create(req.body);
    res.status(201).json({ message: "Tạo phiếu yêu cầu thành công", request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Cập nhật trạng thái yêu cầu */
exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await MaterialRequest.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ message: "Cập nhật thành công", request: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
