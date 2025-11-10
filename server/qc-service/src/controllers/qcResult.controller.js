const QCResult = require("../models/QCResult");
const QCRequest = require("../models/QCRequest");
const { publishEvent } = require("../utils/eventPublisher"); // nếu có, else comment out
const DefectCategory = require("../models/QCDefectCategory");


/** Ghi nhận kết quả QC */
exports.createResult = async (req, res) => {
  try {
    // client nên gửi qcRequest (id của QCRequest), ketQuaChung: "Dat"|"Khong dat", soLuongDat, soLuongLoi, chiTietTieuChi, phanLoaiLoi
    const {
      qcRequest,         // id của phiếu QCRequest
      ketQuaChung,       // "Dat" hoặc "Khong dat"
      soLuongDat,
      soLuongLoi,
      chiTietTieuChi,
      phanLoaiLoi,
      nguoiKiemTra,
      ghiChu
    } = req.body;

    // kiểm tra phiếu tồn tại
    const parent = await QCRequest.findById(qcRequest);
    if (!parent) return res.status(404).json({ error: "Phiếu QC không tồn tại" });

    // tạo result
    const result = await QCResult.create({
      qcRequest,
      ketQuaChung,
      soLuongDat: soLuongDat || 0,
      soLuongLoi: soLuongLoi || 0,
      chiTietTieuChi: chiTietTieuChi || [],
      phanLoaiLoi: phanLoaiLoi || [],
      nguoiKiemTra,
      ghiChu,
      ngayKiemTra: new Date()
    });

    // Cập nhật trạng thái phiếu QCRequest => "Đã kiểm định"
    parent.trangThai = "Đã kiểm định";
    await parent.save();

    // Nếu đạt → gửi event QC_PASSED sang warehouse-service (nếu bạn có hệ thống event)
    if (ketQuaChung === "Dat") {
      try {
        await publishEvent && publishEvent("QC_PASSED", { qcResultId: result._id, qcRequestId: qcRequest });
      } catch (e) {
        // Log error event publish nhưng không block response
        console.error("Failed to publish QC_PASSED event:", e.message);
      }
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
      .populate("qcRequest phanLoaiLoi")
      // nguoiKiemTra
      .sort({ ngayKiemTra: -1 });
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Lấy 1 kết quả theo id */
exports.getResultById = async (req, res) => {
  try {
    const item = await QCResult.findById(req.params.id).populate("qcRequest phanLoaiLoi");
    // nguoiKiemTra
    if (!item) return res.status(404).json({ error: "Không có kết quả" });
    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
