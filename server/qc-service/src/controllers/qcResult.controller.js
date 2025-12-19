const QCResult = require("../models/QCResult");
const QCRequest = require("../models/QCRequest");
const { publishEvent } = require("../utils/eventPublisher"); // nếu có, else comment out
const DefectCategory = require("../models/QCDefectCategory");
const axios = require("axios");

const GATEWAY_URL = process.env.GATEWAY_URL || "http://api-gateway:4000";
const FACTORY_SERVICE_URL = process.env.FACTORY_SERVICE_URL || "http://factory-service:3003";


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

    // Cập nhật số lượng lô sản xuất từ kết quả QC
    try {
      await updateLotFromQcResult(result, parent);
      console.log(`✅ Đã cập nhật số lượng lô sản xuất từ kết quả QC: ${result._id}`);
    } catch (lotError) {
      console.error("❌ Lỗi cập nhật lô sản xuất:", lotError.message);
      // Không block response nếu lỗi cập nhật lô
    }

    // Nếu đạt → gửi event QC_PASSED sang warehouse-service (nếu bạn có hệ thống event)
    if (ketQuaChung === "Dat") {
      try {
        if (publishEvent) {
          await publishEvent("QC_PASSED", { qcResultId: result._id, qcRequestId: qcRequest });
        }
      } catch (e) {
        // Log error event publish nhưng không block response
        console.error("⚠️ Failed to publish QC_PASSED event (RabbitMQ may be down):", e.message);
        // Không throw để không block response
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
      .populate({
        path: "qcRequest",
        populate: [
          {
            path: "sanPham",
            select: "_id maSP tenSanPham tenSP ProductName",
            strictPopulate: false // Cho phép populate ngay cả khi ref không tồn tại
          }
          // Không populate keHoach vì nó là plain object, không phải ref
        ],
        strictPopulate: false // Cho phép populate ngay cả khi ref không tồn tại
      })
      .populate({
        path: "phanLoaiLoi",
        strictPopulate: false // Cho phép populate ngay cả khi ref không tồn tại
      })
      // nguoiKiemTra
      .sort({ ngayKiemTra: -1 })
      .lean(); // Dùng lean() để tránh lỗi khi populate fail
    
    // Xử lý dữ liệu để đảm bảo format đúng
    const processedList = list.map(item => {
      // Đảm bảo qcRequest có dữ liệu
      if (!item.qcRequest) {
        return item;
      }
      
      // Nếu sanPham không được populate, dùng sanPhamName hoặc từ keHoach
      if (!item.qcRequest.sanPham || !item.qcRequest.sanPham._id) {
        if (item.qcRequest.sanPhamName) {
          item.qcRequest.sanPham = {
            tenSP: item.qcRequest.sanPhamName,
            tenSanPham: item.qcRequest.sanPhamName,
            ProductName: item.qcRequest.sanPhamName
          };
        } else if (item.qcRequest.keHoach?.sanPham) {
          item.qcRequest.sanPham = {
            maSP: item.qcRequest.keHoach.sanPham.maSP,
            tenSP: item.qcRequest.keHoach.sanPham.tenSanPham,
            tenSanPham: item.qcRequest.keHoach.sanPham.tenSanPham,
            ProductName: item.qcRequest.keHoach.sanPham.tenSanPham
          };
        }
      }
      
      return item;
    });
    
    res.status(200).json(processedList);
  } catch (err) {
    console.error("❌ [getAllResults] Lỗi:", err);
    res.status(500).json({ error: err.message });
  }
};

/** Lấy 1 kết quả theo id */
exports.getResultById = async (req, res) => {
  try {
    const item = await QCResult.findById(req.params.id)
      .populate({
        path: "qcRequest",
        populate: {
          path: "sanPham",
          select: "_id maSP tenSanPham tenSP ProductName"
        }
      })
      .populate("phanLoaiLoi");
    // nguoiKiemTra
    if (!item) return res.status(404).json({ error: "Không có kết quả" });
    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Cập nhật số lượng lô sản xuất từ kết quả QC
 */
async function updateLotFromQcResult(qcResult, qcRequest) {
  try {
    // Gọi API factory-service qua gateway để cập nhật số lượng lô
    const response = await axios.put(
      `${GATEWAY_URL}/factory/api/lot/update-from-qc-result`,
      {
        qcResultId: qcResult._id.toString(),
        qcRequestId: qcRequest._id.toString(),
        soLuongDat: qcResult.soLuongDat || 0,
        soLuongLoi: qcResult.soLuongLoi || 0,
        ketQuaChung: qcResult.ketQuaChung,
        keHoach: qcRequest.keHoach?.planId || qcRequest.keHoach?.toString() || qcRequest.keHoach,
      }
    );
    return response.data;
  } catch (err) {
    console.error("❌ Error updating lot from QC result:", err.message);
    // Không throw để không block response, chỉ log lỗi
    return null;
  }
}
