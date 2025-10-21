const ProductionLog = require("../models/ProductionLog");

/** Lấy nhật ký sản xuất */
exports.getAllLogs = async (req, res) => {
  try {
    const logs = await ProductionLog.find()
      .populate("xuong to ca nguoiGhi danhSachSanPham.sanPham")
      .sort({ ngayGhi: -1 });
    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Ghi nhật ký sản xuất */
exports.createLog = async (req, res) => {
  try {
    const log = await ProductionLog.create(req.body);
    res.status(201).json({ message: "Ghi nhật ký thành công", log });

    // 🚀 TODO: nếu cần, gửi event PRODUCTION_DONE cho QC-Service
    // RabbitMQ.publish("PRODUCTION_DONE", log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
