const QCResult = require("../models/QCResult");
const QCRequest = require("../models/QCRequest");
const { publishEvent } = require("../utils/eventPublisher");

/** Ghi nhận kết quả QC */
exports.createResult = async (req, res) => {
  try {
    const { requestId, ketQua, soLuongDat, soLuongLoi, danhMucLoi, ghiChu } = req.body;

    const result = await QCResult.create({
      phieuKiemTra: requestId,
      ketQua,
      soLuongDat,
      soLuongLoi,
      danhMucLoi,
      ghiChu,
      ngayKiemTra: new Date(),
    });

    // Cập nhật trạng thái phiếu QCRequest
    const newStatus = ketQua === "Đạt" ? "Hoàn thành" : "Không đạt";
    await QCRequest.findByIdAndUpdate(requestId, { trangThai: newStatus });

    // Nếu đạt → gửi event QC_PASSED sang warehouse-service
    if (ketQua === "Đạt") {
      await publishEvent("QC_PASSED", result);
    }

    res.status(201).json({ message: "Đã ghi kết quả kiểm tra", result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Lấy danh sách kết quả kiểm tra */
exports.getAllResults = async (req, res) => {
  try {
    const list = await QCResult.find()
      .populate("phieuKiemTra danhMucLoi")
      .sort({ ngayKiemTra: -1 });
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
