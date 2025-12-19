const QCRequest = require("../models/QCRequest");
const QCResult = require("../models/QCResult");
const axios = require("axios");

const GATEWAY_URL = process.env.GATEWAY_URL || "http://api-gateway:4000";
const FACTORY_SERVICE_URL = process.env.FACTORY_SERVICE_URL || "http://factory-service:3003";

/** Tạo phiếu yêu cầu kiểm tra tạm thời */
exports.createTempRequest = async (req, res) => {
  try {
    const {
      maPhieuQC,
      keHoach,
      sanPham,
      sanPhamName,
      loSanXuat,
      soLuong,
      xuong,
      ngayYeuCau,
      nguoiYeuCau,
      ghiChu
    } = req.body;

    console.log(`🔍 [createTempRequest] Input keHoach:`, {
      keHoach,
      type: typeof keHoach,
      isString: typeof keHoach === 'string',
      isObject: typeof keHoach === 'object',
      hasPlanId: !!keHoach?.planId,
      planId: keHoach?.planId,
      planIdType: typeof keHoach?.planId,
      planIdIsEmpty: keHoach?.planId === "",
      fullObject: JSON.stringify(keHoach, null, 2),
    });
    
    // Đảm bảo keHoach là object với cấu trúc đúng
    let keHoachData = undefined;
    if (keHoach) {
      if (typeof keHoach === 'string') {
        // Nếu là string, tạo object với planId (chỉ nếu string không rỗng)
        if (keHoach.trim() !== "") {
          keHoachData = {
            planId: keHoach.trim(),
            maKeHoach: "",
            sanPham: {}
          };
          console.log(`✅ [createTempRequest] Chuyển keHoach từ string sang object:`, keHoachData);
        } else {
          console.warn(`⚠️ [createTempRequest] keHoach là string rỗng, bỏ qua`);
        }
      } else if (typeof keHoach === 'object' && keHoach !== null) {
        // Nếu là object, đảm bảo có cấu trúc đúng
        const extractedPlanId = (keHoach.planId?.toString() || keHoach._id?.toString() || "").trim();
        
        // CHỈ lưu keHoach nếu có planId hợp lệ (không rỗng)
        if (extractedPlanId && extractedPlanId !== "") {
          keHoachData = {
            planId: extractedPlanId,
            maKeHoach: keHoach.maKeHoach || keHoach.maKH || "",
            sanPham: keHoach.sanPham || {}
          };
          console.log(`✅ [createTempRequest] Tạo keHoachData từ object với planId: ${extractedPlanId}`, keHoachData);
        } else {
          console.warn(`⚠️ [createTempRequest] keHoach object không có planId hợp lệ!`, {
            keHoach,
            extractedPlanId,
            keys: Object.keys(keHoach),
          });
          console.warn(`⚠️ [createTempRequest] Sẽ KHÔNG lưu keHoach vào QCRequest vì thiếu planId`);
        }
      }
    } else {
      console.warn(`⚠️ [createTempRequest] Không có keHoach trong request body!`);
    }
    
    const tempRequest = new QCRequest({
      maPhieuQC,
      keHoach: keHoachData, // Lưu keHoach dưới dạng object
      sanPham,
      sanPhamName,
      loSanXuat,
      soLuong,
      xuong,
      ngayYeuCau: ngayYeuCau ? new Date(ngayYeuCau) : undefined,
      nguoiYeuCau,
      // Mặc định: tổ trưởng tạo xong thì chờ xưởng trưởng duyệt
      trangThai: "Cho duyet xuong",
      ghiChu
    });

    await tempRequest.save();
    
    console.log(`✅ [createTempRequest] Đã lưu QCRequest:`, {
      _id: tempRequest._id,
      maPhieuQC: tempRequest.maPhieuQC,
      hasKeHoach: !!tempRequest.keHoach,
      keHoach: tempRequest.keHoach,
      keHoachType: typeof tempRequest.keHoach,
      hasPlanId: !!tempRequest.keHoach?.planId,
      planId: tempRequest.keHoach?.planId,
      planIdIsEmpty: tempRequest.keHoach?.planId === "",
      keHoachString: tempRequest.keHoach?.toString()
    });
    
    // Cảnh báo nếu không có keHoach hoặc planId
    if (!tempRequest.keHoach || !tempRequest.keHoach.planId || tempRequest.keHoach.planId === "") {
      console.error(`❌ [createTempRequest] QCRequest ${tempRequest._id} được tạo KHÔNG có planId!`);
      console.error(`   Điều này sẽ gây lỗi khi tìm planId sau này.`);
    }

    // Cập nhật thông tin vào lô sản xuất (nếu có kế hoạch)
    if (keHoach) {
      try {
        await updateLotFromQcRequest(tempRequest);
        console.log(`✅ Đã cập nhật lô sản xuất từ phiếu QC: ${tempRequest.maPhieuQC}`);
      } catch (lotError) {
        console.error("❌ Lỗi cập nhật lô sản xuất:", lotError.message);
        // Không block response nếu lỗi cập nhật lô
      }
    }

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
      .populate("sanPham", "_id maSP tenSanPham tenSP ProductName");
    // Không populate keHoach vì nó là plain object, không phải ref
    // .populate("nguoiYeuCau");
    if (!item) return res.status(404).json({ error: "Không tìm thấy phiếu" });
    
    // Đảm bảo keHoach được trả về đúng format (object)
    const itemData = item.toObject();
    
    // keHoach đã là plain object, không cần populate
    // Chỉ cần đảm bảo nó là object hợp lệ
    if (itemData.keHoach && typeof itemData.keHoach === 'string') {
      // Nếu vô tình là string (dữ liệu cũ), chuyển thành object
      try {
        itemData.keHoach = JSON.parse(itemData.keHoach);
      } catch (e) {
        // Nếu không parse được, tạo object mới
        itemData.keHoach = {
          planId: itemData.keHoach,
          maKeHoach: "",
          sanPham: {}
        };
      }
    } else if (!itemData.keHoach || typeof itemData.keHoach !== 'object') {
      // Nếu không có hoặc không phải object, set về undefined
      itemData.keHoach = undefined;
    }
    
    console.log(`🔍 [getRequestById] QCRequest data:`, {
      _id: itemData._id,
      maPhieuQC: itemData.maPhieuQC,
      keHoach: itemData.keHoach,
      keHoachType: typeof itemData.keHoach,
      keHoachIsObject: typeof itemData.keHoach === 'object'
    });
    
    res.status(200).json(itemData);
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

    const updated = await QCRequest.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate("nguoiYeuCau sanPham");
    // Không populate keHoach vì nó là plain object, không phải ref
    if (!updated) return res.status(404).json({ error: "Không tìm thấy phiếu để cập nhật" });
    res.status(200).json({ message: "Cập nhật phiếu yêu cầu thành công", updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Cập nhật thông tin lô sản xuất từ phiếu QC request
 */
async function updateLotFromQcRequest(qcRequest) {
  try {
    // Lấy planId từ keHoach object
    const planId = qcRequest.keHoach?.planId || 
                   qcRequest.keHoach?.toString() || 
                   qcRequest.keHoach;
    
    // Gọi API factory-service qua gateway để cập nhật lô
    const response = await axios.put(
      `${GATEWAY_URL}/factory/api/lot/update-from-qc-request`,
      {
        qcRequestId: qcRequest._id.toString(),
        maPhieuQC: qcRequest.maPhieuQC,
        loSanXuat: qcRequest.loSanXuat,
        soLuong: qcRequest.soLuong,
        keHoach: planId, // Chỉ gửi planId (string)
      }
    );
    return response.data;
  } catch (err) {
    console.error("❌ Error updating lot from QC request:", err.message);
    throw err;
  }
}

/**
 * Migration: Cập nhật keHoach cho các QCRequest cũ thiếu keHoach
 * Tìm planId từ WorkAssignment hoặc LoSanXuat dựa trên thông tin QCRequest
 */
exports.migrateKeHoach = async (req, res) => {
  try {
    console.log("🔄 [migrateKeHoach] Bắt đầu migration keHoach cho QCRequest...");
    
    // Lấy tất cả QCRequest không có keHoach hoặc keHoach không có planId
    const requests = await QCRequest.find({
      $or: [
        { keHoach: { $exists: false } },
        { "keHoach.planId": { $exists: false } },
        { "keHoach.planId": null },
        { "keHoach.planId": "" }
      ]
    });
    
    console.log(`📊 [migrateKeHoach] Tìm thấy ${requests.length} QCRequest cần migration`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const qcRequest of requests) {
      try {
        let planId = null;
        let maKeHoach = "";
        let sanPham = {};
        
        // Thử tìm từ WorkAssignment qua gateway
        try {
          const assignmentsResponse = await axios.get(
            `${GATEWAY_URL}/factory/manager/assignments`
          );
          const assignments = Array.isArray(assignmentsResponse.data) ? assignmentsResponse.data : [];
          
          const matchingAssignment = assignments
            .filter(a => {
              const xuongMatch = qcRequest.xuong ? 
                (a.xuong?.tenXuong?.toLowerCase().includes(qcRequest.xuong.toLowerCase()) ||
                 qcRequest.xuong.toLowerCase().includes(a.xuong?.tenXuong?.toLowerCase() || "")) : true;
              
              const sanPhamMatch = qcRequest.sanPhamName ?
                (a.keHoach?.sanPham?.tenSanPham?.toLowerCase().includes(qcRequest.sanPhamName.toLowerCase()) ||
                 qcRequest.sanPhamName.toLowerCase().includes(a.keHoach?.sanPham?.tenSanPham?.toLowerCase() || "")) : true;
              
              return xuongMatch && sanPhamMatch && a.keHoach?.planId;
            })
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0];
          
          if (matchingAssignment && matchingAssignment.keHoach) {
            planId = matchingAssignment.keHoach.planId;
            maKeHoach = matchingAssignment.keHoach.maKeHoach || "";
            sanPham = matchingAssignment.keHoach.sanPham || {};
          }
        } catch (assignErr) {
          console.error(`❌ [migrateKeHoach] Lỗi tìm từ WorkAssignment cho ${qcRequest._id}:`, assignErr.message);
        }
        
        // Thử tìm từ LoSanXuat nếu chưa có (qua gateway)
        if (!planId && qcRequest.loSanXuat) {
          try {
            const lotsResponse = await axios.get(`${GATEWAY_URL}/factory/api/lot`);
            const lots = Array.isArray(lotsResponse.data) ? lotsResponse.data : [];
            
            const matchingLot = lots.find(lot => {
              const lotTenTo = lot.toSanXuat?.tenTo || "";
              return lotTenTo.toLowerCase().includes(qcRequest.loSanXuat.toLowerCase()) ||
                     qcRequest.loSanXuat.toLowerCase().includes(lotTenTo.toLowerCase());
            });
            
            if (matchingLot && matchingLot.keHoach?.planId) {
              planId = matchingLot.keHoach.planId;
              maKeHoach = matchingLot.keHoach?.maKeHoach || "";
              sanPham = matchingLot.sanPham || {};
            }
          } catch (lotErr) {
            console.error(`❌ [migrateKeHoach] Lỗi tìm từ LoSanXuat cho ${qcRequest._id}:`, lotErr.message);
          }
        }
        
        if (planId) {
          qcRequest.keHoach = {
            planId: planId.toString(),
            maKeHoach: maKeHoach,
            sanPham: sanPham
          };
          await qcRequest.save();
          updatedCount++;
          console.log(`✅ [migrateKeHoach] Đã cập nhật QCRequest ${qcRequest._id} với planId: ${planId}`);
        } else {
          skippedCount++;
          console.warn(`⚠️ [migrateKeHoach] Không tìm thấy planId cho QCRequest ${qcRequest._id}`);
        }
      } catch (err) {
        console.error(`❌ [migrateKeHoach] Lỗi xử lý QCRequest ${qcRequest._id}:`, err.message);
        skippedCount++;
      }
    }
    
    console.log(`✅ [migrateKeHoach] Migration hoàn tất:`);
    console.log(`   - Đã cập nhật: ${updatedCount} QCRequest`);
    console.log(`   - Bỏ qua: ${skippedCount} QCRequest`);
    
    res.status(200).json({
      message: "Migration keHoach hoàn tất",
      updated: updatedCount,
      skipped: skippedCount,
      total: requests.length
    });
  } catch (err) {
    console.error("❌ [migrateKeHoach] Lỗi:", err);
    res.status(500).json({ error: err.message });
  }
};
