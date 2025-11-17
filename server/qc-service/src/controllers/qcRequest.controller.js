const QCRequest = require("../models/QCRequest");
const QCResult = require("../models/QCResult");

/** Tạo phiếu yêu cầu kiểm tra tạm thời */
exports.createTempRequest = async (req, res) => {
  try {
    const {
      maPhieuQC,
      keHoach,
      sanPham,
      loSanXuat,
      soLuong,
      xuong,
      ngayYeuCau,
      nguoiYeuCau,
      ghiChu
    } = req.body;

    const tempRequest = new QCRequest({
      maPhieuQC,
      keHoach,
      sanPham,
      loSanXuat,
      soLuong,
      xuong,
      ngayYeuCau: ngayYeuCau ? new Date(ngayYeuCau) : undefined,
      nguoiYeuCau,
      trangThai: "Chưa kiểm định",
      ghiChu
    });

    await tempRequest.save();

    res.status(201).json({ message: "Phiếu yêu cầu kiểm tra tạm thời đã được tạo", tempRequest });
  } catch (err) {
    // Nếu lỗi unique maPhieuQC
    if (err.code === 11000) {
      return res.status(400).json({ error: "maPhieuQC đã tồn tại" });
    }
    res.status(500).json({ error: err.message });
  }
};

/** Lấy danh sách tất cả phiếu yêu cầu */
exports.getAllRequests = async (req, res) => {
  try {
    // populate các ref quan trọng: nguoiYeuCau, sanPham, keHoach
    const list = await QCRequest.find()
      // .populate("nguoiYeuCau sanPham keHoach")
      .sort({ ngayYeuCau: -1 });
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Lấy 1 phiếu theo id */
exports.getRequestById = async (req, res) => {
  try {
    const item = await QCRequest.findById(req.params.id)
    // .populate("nguoiYeuCau sanPham keHoach");
    if (!item) return res.status(404).json({ error: "Không tìm thấy phiếu" });
    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Cập nhật trạng thái hoặc thông tin phiếu (tránh update toàn bộ doc từ client) */
exports.updateRequestStatus = async (req, res) => {
  try {
    // chỉ cho phép update 1 số trường an toàn
    const allowed = ["trangThai", "ghiChu"];
    const updates = {};
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });

    const updated = await QCRequest.findByIdAndUpdate(req.params.id, updates, { new: true }).populate("nguoiYeuCau sanPham keHoach");
    if (!updated) return res.status(404).json({ error: "Không tìm thấy phiếu để cập nhật" });
    res.status(200).json({ message: "Cập nhật phiếu yêu cầu thành công", updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
