const QCResult = require("../models/QCResult");

/** Lấy danh sách kết quả kiểm tra */
exports.getAllResults = async (req, res) => {
  try {
    const results = await QCResult.find()
      .populate("phieuYeuCau nguoiKiemTra danhSachLoi.loaiLoi sanPham")
      .sort({ ngayKiemTra: -1 });
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Ghi kết quả kiểm tra */
exports.createResult = async (req, res) => {
  try {
    const result = await QCResult.create(req.body);
    res.status(201).json({ message: "Ghi kết quả kiểm tra thành công", result });

    // 🚀 TODO: Gửi event QC_PASSED / QC_FAILED cho material-service
    // RabbitMQ.publish("QC_PASSED", result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
