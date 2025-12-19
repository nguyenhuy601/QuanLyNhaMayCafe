const LoSanXuat = require("../models/LoSanXuat");

/**
 * Cập nhật lô sản xuất từ phiếu QC request (khi tổ Sàng lọc tạo phiếu QC)
 */
exports.updateFromQcRequest = async (req, res) => {
  try {
    const { qcRequestId, maPhieuQC, loSanXuat, soLuong, keHoach } = req.body;

    if (!keHoach) {
      return res.status(400).json({ error: "Thiếu thông tin kế hoạch" });
    }

    // Tìm lô theo kế hoạch
    const lo = await LoSanXuat.findOne({
      "keHoach.planId": keHoach.toString() || keHoach
    }).sort({ createdAt: -1 });

    if (!lo) {
      return res.status(404).json({ error: "Không tìm thấy lô sản xuất cho kế hoạch này" });
    }

    // Cập nhật thông tin lô từ phiếu QC
    lo.loSanXuat = loSanXuat || lo.loSanXuat;
    lo.phieuQC = qcRequestId?.toString() || qcRequestId;
    lo.trangThai = "Cho QC"; // Chuyển trạng thái sang chờ QC

    // Cập nhật số lượng nếu có (từ phiếu QC)
    if (soLuong && soLuong > 0) {
      lo.soLuong = soLuong;
    }

    await lo.save();

    console.log(`✅ Đã cập nhật lô ${lo.maLo} từ phiếu QC: ${maPhieuQC}`);

    res.status(200).json({
      message: "Đã cập nhật lô sản xuất từ phiếu QC",
      lot: lo
    });
  } catch (err) {
    console.error("❌ Error updating lot from QC request:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Cập nhật số lượng lô sản xuất từ kết quả QC
 */
exports.updateFromQcResult = async (req, res) => {
  try {
    const { qcResultId, qcRequestId, soLuongDat, soLuongLoi, ketQuaChung, keHoach } = req.body;

    if (!keHoach) {
      return res.status(400).json({ error: "Thiếu thông tin kế hoạch" });
    }

    // Tìm lô theo kế hoạch
    const lo = await LoSanXuat.findOne({
      "keHoach.planId": keHoach.toString() || keHoach
    }).sort({ createdAt: -1 });

    if (!lo) {
      return res.status(404).json({ error: "Không tìm thấy lô sản xuất cho kế hoạch này" });
    }

    // Cập nhật số lượng từ kết quả QC
    if (soLuongDat !== undefined && soLuongDat >= 0) {
      lo.soLuong = soLuongDat; // Cập nhật số lượng đạt
    }

    // Cập nhật trạng thái lô
    if (ketQuaChung === "Dat") {
      lo.trangThai = "Da QC";
    } else if (ketQuaChung === "Khong dat") {
      lo.trangThai = "Cho QC"; // Vẫn chờ QC lại
    }

    // Lưu thông tin phiếu QC result
    lo.phieuQC = qcRequestId?.toString() || qcRequestId;

    await lo.save();

    console.log(`✅ Đã cập nhật số lượng lô ${lo.maLo}: ${soLuongDat} (từ kết quả QC)`);

    res.status(200).json({
      message: "Đã cập nhật số lượng lô sản xuất từ kết quả QC",
      lot: lo
    });
  } catch (err) {
    console.error("❌ Error updating lot from QC result:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Lấy danh sách lô sản xuất
 */
exports.getAllLots = async (req, res) => {
  try {
    const { keHoach, trangThai } = req.query;
    let filter = {};

    if (keHoach) {
      filter["keHoach.planId"] = keHoach;
    }

    if (trangThai) {
      filter.trangThai = trangThai;
    }

    const lots = await LoSanXuat.find(filter).sort({ createdAt: -1 });
    res.status(200).json(lots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Lấy lô theo ID
 */
exports.getLotById = async (req, res) => {
  try {
    const lo = await LoSanXuat.findById(req.params.id);
    if (!lo) {
      return res.status(404).json({ error: "Không tìm thấy lô sản xuất" });
    }
    res.status(200).json(lo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Cập nhật lô sản xuất
 */
exports.updateLot = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const lo = await LoSanXuat.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!lo) {
      return res.status(404).json({ error: "Không tìm thấy lô sản xuất" });
    }
    
    console.log(`✅ Đã cập nhật lô ${lo.maLo}:`, updateData);
    
    res.status(200).json({
      message: "Đã cập nhật lô sản xuất",
      lot: lo
    });
  } catch (err) {
    console.error("❌ Error updating lot:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Xóa tất cả lô sản xuất theo kế hoạch
 */
exports.deleteLotsByPlanId = async (req, res) => {
  try {
    const { planId } = req.params;
    
    if (!planId) {
      return res.status(400).json({ error: "Thiếu planId" });
    }

    const result = await LoSanXuat.deleteMany({
      "keHoach.planId": planId.toString()
    });

    console.log(`✅ [deleteLotsByPlanId] Đã xóa ${result.deletedCount} lô sản xuất cho kế hoạch ${planId}`);
    
    res.status(200).json({
      message: `Đã xóa ${result.deletedCount} lô sản xuất`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error("❌ [deleteLotsByPlanId] Lỗi:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Migration: Cập nhật trạng thái cho tất cả lô sản xuất cũ không có trạng thái
 */
exports.migrateLotStatus = async (req, res) => {
  try {
    console.log("🔄 [migrateLotStatus] Bắt đầu migration trạng thái lô sản xuất...");
    
    // Tìm tất cả lô không có trạng thái hoặc trạng thái không hợp lệ
    const allLots = await LoSanXuat.find({});
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const lot of allLots) {
      const validStatuses = ["Da tao", "Cho QC", "Da QC", "Da nhap kho", "Da xuat kho", "Hoan thanh"];
      const needsUpdate = !lot.trangThai || !validStatuses.includes(lot.trangThai);
      
      if (needsUpdate) {
        // Xác định trạng thái dựa trên dữ liệu hiện có
        let newStatus = "Da tao"; // Mặc định
        
        if (lot.phieuNhapKho) {
          // Nếu đã có phiếu nhập kho, có thể là "Hoàn thành"
          newStatus = "Hoan thanh";
        } else if (lot.phieuQC) {
          // Nếu đã có phiếu QC, có thể là "Da QC"
          newStatus = "Da QC";
        }
        
        lot.trangThai = newStatus;
        await lot.save();
        updatedCount++;
        console.log(`✅ [migrateLotStatus] Đã cập nhật lô ${lot.maLo || lot._id}: "${newStatus}"`);
      } else {
        skippedCount++;
      }
    }
    
    console.log(`✅ [migrateLotStatus] Migration hoàn tất:`);
    console.log(`   - Đã cập nhật: ${updatedCount} lô`);
    console.log(`   - Bỏ qua: ${skippedCount} lô (đã có trạng thái hợp lệ)`);
    
    res.status(200).json({
      message: "Migration trạng thái lô sản xuất hoàn tất",
      updated: updatedCount,
      skipped: skippedCount,
      total: allLots.length
    });
  } catch (err) {
    console.error("❌ [migrateLotStatus] Lỗi:", err);
    res.status(500).json({ error: err.message });
  }
};

