const FinishedReceipt = require("../../models/FinishedReceipt");
const axios = require("axios");
const { updateProductQuantity } = require("../../utils/productClient");

const GATEWAY_URL = process.env.GATEWAY_URL || "http://api-gateway:4000";

exports.getAllFinishedReceipts = async (req, res) => {
  try {
    const list = await FinishedReceipt.find();
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createFinishedReceipt = async (req, res) => {
  try {
    const { phieuQC, sanPhamName, soLuong, loSanXuat, ngaySanXuat, hanSuDung, khoLuuTru, ghiChu } = req.body;
    const nguoiLap = req.user?.id || req.user?._id || null;
    
    console.log(`🔍 [createFinishedReceipt] Request body:`, {
      phieuQC,
      sanPhamName,
      soLuong,
      hasSanPhamName: !!sanPhamName
    });

    // Validate required fields
    if (!phieuQC || !soLuong) {
      return res.status(400).json({ 
        error: "Thiếu thông tin bắt buộc: phieuQC, soLuong" 
      });
    }
    
    // Lấy sanPhamName từ request body hoặc từ QCRequest
    let finalSanPhamName = sanPhamName;
    console.log(`🔍 [createFinishedReceipt] Bắt đầu lấy sanPhamName. Input sanPhamName: ${sanPhamName}, phieuQC: ${phieuQC}`);
    
    if (!finalSanPhamName && phieuQC) {
      try {
        console.log(`🔍 [createFinishedReceipt] Bước 1: Lấy QCResult từ QC Service...`);
        // Lấy QCResult để tìm QCRequest - gọi qua gateway
        const qcResultsResponse = await axios.get(`${GATEWAY_URL}/qc-result`, {
          headers: req.headers.authorization ? { Authorization: req.headers.authorization } : {}
        });
        const qcResults = Array.isArray(qcResultsResponse.data) ? qcResultsResponse.data : [];
        console.log(`🔍 [createFinishedReceipt] Tìm thấy ${qcResults.length} QCResult`);
        
        const qcResult = qcResults.find(qr => 
          qr._id?.toString() === phieuQC?.toString() || 
          qr.qcRequest?._id?.toString() === phieuQC?.toString()
        );
        
        if (!qcResult) {
          console.error(`❌ [createFinishedReceipt] Không tìm thấy QCResult với phieuQC: ${phieuQC}`);
        } else {
          console.log(`✅ [createFinishedReceipt] Tìm thấy QCResult: ${qcResult._id}, qcRequest._id: ${qcResult.qcRequest?._id}`);
          
          if (qcResult?.qcRequest?._id) {
            console.log(`🔍 [createFinishedReceipt] Bước 2: Lấy QCRequest detail từ QC Service...`);
            // Lấy QCRequest detail - gọi qua gateway
            const qcRequestResponse = await axios.get(`${GATEWAY_URL}/qc-request/${qcResult.qcRequest._id}`, {
              headers: req.headers.authorization ? { Authorization: req.headers.authorization } : {}
            });
            const qcRequest = qcRequestResponse.data;
            
            console.log(`🔍 [createFinishedReceipt] QCRequest data:`, JSON.stringify({
              _id: qcRequest?._id,
              keHoach: qcRequest?.keHoach,
              keHoachType: typeof qcRequest?.keHoach,
              loSanXuat: qcRequest?.loSanXuat,
              sanPhamName: qcRequest?.sanPhamName
            }, null, 2));
            
            // Lấy sanPhamName từ QCRequest nếu chưa có
            if (!finalSanPhamName && qcRequest?.sanPhamName) {
              finalSanPhamName = qcRequest.sanPhamName;
              console.log(`✅ [createFinishedReceipt] Đã lấy sanPhamName từ QCRequest: ${finalSanPhamName}`);
            }
            
            // Nếu vẫn chưa có, thử lấy từ kế hoạch (planService) thông qua keHoach
            if (!finalSanPhamName && qcRequest?.keHoach) {
              const planId = typeof qcRequest.keHoach === 'object' 
                ? (qcRequest.keHoach._id || qcRequest.keHoach.id || qcRequest.keHoach)
                : qcRequest.keHoach;
              
              if (planId) {
                console.log(`🔍 [createFinishedReceipt] Bước 3: Lấy kế hoạch từ planService qua gateway. planId: ${planId}`);
                console.log(`🔍 [createFinishedReceipt] URL: ${GATEWAY_URL}/plan/${planId}`);
                
                try {
                  // Gọi qua API Gateway
                  const planResponse = await axios.get(`${GATEWAY_URL}/plan/${planId}`, {
                    headers: req.headers.authorization ? { Authorization: req.headers.authorization } : {},
                    timeout: 10000
                  });
                  const plan = planResponse.data;
                  
                  console.log(`🔍 [createFinishedReceipt] Plan response status: ${planResponse.status}`);
                  console.log(`🔍 [createFinishedReceipt] Plan data từ planService:`, JSON.stringify({
                    _id: plan?._id,
                    maKeHoach: plan?.maKeHoach,
                    sanPham: plan?.sanPham,
                    sanPhamType: typeof plan?.sanPham,
                    sanPhamKeys: plan?.sanPham ? Object.keys(plan.sanPham) : [],
                    sanPhamProductId: plan?.sanPham?.productId
                  }, null, 2));
                  
                if (plan?.sanPham) {
                  // Lấy tên sản phẩm từ kế hoạch
                  if (plan.sanPham.tenSanPham) {
                    finalSanPhamName = plan.sanPham.tenSanPham;
                    console.log(`✅ [createFinishedReceipt] Đã lấy sanPham.tenSanPham từ kế hoạch: ${finalSanPhamName}`);
                  } else {
                    console.warn(`⚠️ [createFinishedReceipt] Kế hoạch có sanPham nhưng không có tenSanPham:`, plan.sanPham);
                  }
                } else {
                  console.warn(`⚠️ [createFinishedReceipt] Kế hoạch ${planId} không có sanPham hoặc sanPham là null/undefined`);
                }
                } catch (planErr) {
                  console.error("❌ [createFinishedReceipt] Lỗi lấy kế hoạch từ planService qua gateway:", {
                    message: planErr.message,
                    code: planErr.code,
                    status: planErr.response?.status,
                    statusText: planErr.response?.statusText,
                    data: planErr.response?.data,
                    url: `${GATEWAY_URL}/plan/${planId}`
                  });
                }
            } else {
              console.warn(`⚠️ [createFinishedReceipt] QCRequest có keHoach nhưng planId là null/undefined:`, qcRequest.keHoach);
            }
          } else {
            console.warn(`⚠️ [createFinishedReceipt] QCRequest không có keHoach. QCRequest keys:`, Object.keys(qcRequest || {}));
          }
          } else {
            console.error(`❌ [createFinishedReceipt] QCResult không có qcRequest._id`);
          }
        }
      } catch (err) {
        console.error("❌ [createFinishedReceipt] Lỗi lấy sanPham từ QCRequest:", {
          message: err.message,
          stack: err.stack,
          response: err.response?.data
        });
      }
    } else {
      if (finalSanPhamName) {
        console.log(`✅ [createFinishedReceipt] Đã có sanPhamName từ input: ${finalSanPhamName}`);
      } else {
        console.warn(`⚠️ [createFinishedReceipt] Không có phieuQC để lấy sanPhamName`);
      }
    }
    
    // Validate sanPhamName là bắt buộc
    if (!finalSanPhamName) {
      // Lấy sanPhamName từ QCRequest để hiển thị trong thông báo lỗi
      let errorSanPhamName = "không xác định";
      try {
        const qcResultsResponse = await axios.get(`${GATEWAY_URL}/qc-result`, {
          headers: req.headers.authorization ? { Authorization: req.headers.authorization } : {}
        });
        const qcResults = Array.isArray(qcResultsResponse.data) ? qcResultsResponse.data : [];
        const qcResult = qcResults.find(qr => 
          qr._id?.toString() === phieuQC?.toString() || 
          qr.qcRequest?._id?.toString() === phieuQC?.toString()
        );
        if (qcResult?.qcRequest?._id) {
          const qcRequestResponse = await axios.get(`${GATEWAY_URL}/qc-request/${qcResult.qcRequest._id}`, {
            headers: req.headers.authorization ? { Authorization: req.headers.authorization } : {}
          });
          errorSanPhamName = qcRequestResponse.data?.sanPhamName || "không xác định";
        }
      } catch (err) {
        // Ignore error khi lấy sanPhamName
      }
      
      return res.status(400).json({ 
        error: `Thiếu thông tin bắt buộc: sanPhamName (không thể lấy từ QCRequest hoặc request body)` 
      });
    }
    
    console.log(`📦 [createFinishedReceipt] Final sanPhamName: ${finalSanPhamName}`);

    // Generate mã phiếu nhập tự động
    const count = await FinishedReceipt.countDocuments();
    const maPhieuNhapTP = `PNTP${String(count + 1).padStart(6, '0')}`;

    // Xác định trạng thái dựa trên role người tạo
    // Nếu xưởng trưởng tạo → "Cho duyet" (chờ kho xác nhận)
    // Nếu kho thành phẩm tạo → "Da nhap kho" (đã nhập kho ngay)
    const userRole = req.user?.role?.toLowerCase() || '';
    const trangThai = (userRole === 'xuongtruong' || userRole === 'totruong') 
      ? "Cho duyet" 
      : "Da nhap kho";

    // Create receipt
    const receipt = new FinishedReceipt({
      maPhieuNhapTP,
      phieuQC,
      sanPhamName: finalSanPhamName, // Lưu tên sản phẩm thay vì ID
      soLuong: parseInt(soLuong),
      loSanXuat: loSanXuat || '',
      ngaySanXuat: ngaySanXuat ? new Date(ngaySanXuat) : new Date(),
      hanSuDung: hanSuDung ? new Date(hanSuDung) : null,
      nguoiLap,
      khoLuuTru: khoLuuTru || '',
      ghiChu: ghiChu || '',
      trangThai: trangThai,
    });
    
    console.log(`📝 [createFinishedReceipt] Creating receipt with sanPhamName: ${finalSanPhamName}`);

    await receipt.save();

    // Nếu xưởng trưởng tạo phiếu (trạng thái "Cho duyet"), thực hiện các bước:
    // 1. Reset trạng thái hoàn thành của công nhân
    // 2. Reset phân công công việc
    // 3. Chuyển kế hoạch từ "Đang thực hiện" -> "Hoàn thành"
    if (trangThai === "Cho duyet") {
      try {
        // Format headers đúng cách
        const authToken = req.headers.authorization || req.headers.Authorization;
        const headers = authToken ? { Authorization: authToken } : {};
        
        // Lấy planId từ phieuQC
        const planId = await getPlanIdFromPhieuQC(phieuQC, authToken);
        if (planId) {
          // 1. Reset trạng thái hoàn thành của công nhân
          try {
            await resetTeamMemberStatus(planId, headers);
            console.log(`✅ [createFinishedReceipt] Đã reset trạng thái hoàn thành của công nhân cho kế hoạch ${planId}`);
          } catch (resetError) {
            console.error("❌ [createFinishedReceipt] Lỗi reset trạng thái công nhân:", resetError.message);
          }

          // 2. Reset phân công công việc (cập nhật và xóa)
          try {
            await completeAndDeleteAssignments(planId, headers);
            console.log(`✅ [createFinishedReceipt] Đã reset phân công công việc cho kế hoạch ${planId}`);
          } catch (assignError) {
            console.error("❌ [createFinishedReceipt] Lỗi reset phân công công việc:", assignError.message);
          }

          // 3. Chuyển kế hoạch từ "Đang thực hiện" -> "Hoàn thành"
          try {
            await axios.put(
              `${GATEWAY_URL}/plan/${planId}`,
              { trangThai: "Hoàn thành" },
              { headers }
            );
            console.log(`✅ [createFinishedReceipt] Đã chuyển kế hoạch ${planId} từ "Đang thực hiện" sang "Hoàn thành"`);
          } catch (planError) {
            console.error("❌ [createFinishedReceipt] Lỗi cập nhật kế hoạch:", planError.message);
          }
        } else {
          console.warn(`⚠️ [createFinishedReceipt] Không tìm thấy planId từ phieuQC ${phieuQC}, bỏ qua các bước reset`);
        }
      } catch (error) {
        console.error("❌ [createFinishedReceipt] Lỗi tổng quát khi xử lý phiếu nhập của xưởng trưởng:", error.message);
        // Không block response nếu lỗi
      }
    }

    // CHỈ hoàn tất chu kỳ sản xuất khi phiếu đã được xác nhận nhập kho (trạng thái "Da nhap kho")
    // Nếu phiếu ở trạng thái "Cho duyet", chờ kho xác nhận trước
    if (trangThai === "Da nhap kho") {
      // Sau khi tạo phiếu nhập thành phẩm thành công, thực hiện các bước:
      // 1. Cập nhật trạng thái lô thành "Hoàn thành" (với ID phiếu nhập kho)
      // 2. CHỈ KHI lô đã được cập nhật thành công: Reset trạng thái tổ về "Active"
      // 3. Cập nhật kế hoạch trạng thái "Hoàn thành"
      // 4. Cập nhật và xóa phân công công việc
      try {
        await completeProductionCycle(phieuQC, receipt._id.toString(), req.headers.authorization);
        console.log(`✅ Đã hoàn tất chu kỳ sản xuất cho phiếu QC: ${phieuQC}`);
      } catch (cycleError) {
        console.error("❌ Lỗi hoàn tất chu kỳ sản xuất:", cycleError.message);
        // Không block response nếu lỗi
      }
    } else {
      console.log(`ℹ️ [createFinishedReceipt] Phiếu nhập ở trạng thái "${trangThai}", chờ kho xác nhận trước khi hoàn tất chu kỳ sản xuất`);
    }

    res.status(201).json({
      message: "Tạo phiếu nhập thành phẩm thành công",
      receipt,
    });
  } catch (err) {
    console.error("❌ [createFinishedReceipt] Error:", err);
    if (err.code === 11000) {
      // Duplicate key error
      return res.status(400).json({ error: "Mã phiếu nhập đã tồn tại" });
    }
    res.status(500).json({ error: err.message });
  }
};

/**
 * Xóa phiếu nhập thành phẩm
 */
exports.deleteFinishedReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    
    const receipt = await FinishedReceipt.findById(id);
    if (!receipt) {
      return res.status(404).json({ error: "Không tìm thấy phiếu nhập thành phẩm" });
    }

    await FinishedReceipt.findByIdAndDelete(id);
    
    console.log(`✅ Đã xóa phiếu nhập thành phẩm ${receipt.maPhieuNhapTP || id}`);
    
    res.status(200).json({ 
      message: "Đã xóa phiếu nhập thành phẩm thành công",
      deletedReceipt: receipt
    });
  } catch (err) {
    console.error("❌ [deleteFinishedReceipt] Error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Migration: Cập nhật trạng thái cho tất cả phiếu nhập thành phẩm cũ không có trạng thái
 */
exports.migrateReceiptStatus = async (req, res) => {
  try {
    console.log("🔄 [migrateReceiptStatus] Bắt đầu migration trạng thái phiếu nhập thành phẩm...");
    
    // Tìm tất cả phiếu không có trạng thái hoặc trạng thái không hợp lệ
    const allReceipts = await FinishedReceipt.find({});
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const receipt of allReceipts) {
      const validStatuses = ["Cho duyet", "Da duyet", "Da nhap kho", "Da huy"];
      const needsUpdate = !receipt.trangThai || !validStatuses.includes(receipt.trangThai);
      
      if (needsUpdate) {
        // Mặc định là "Da nhap kho" vì các phiếu cũ đã được tạo từ QC đạt
        receipt.trangThai = "Da nhap kho";
        await receipt.save();
        updatedCount++;
        console.log(`✅ [migrateReceiptStatus] Đã cập nhật phiếu ${receipt.maPhieuNhapTP || receipt._id}: "Da nhap kho"`);
      } else {
        skippedCount++;
      }
    }
    
    console.log(`✅ [migrateReceiptStatus] Migration hoàn tất:`);
    console.log(`   - Đã cập nhật: ${updatedCount} phiếu`);
    console.log(`   - Bỏ qua: ${skippedCount} phiếu (đã có trạng thái hợp lệ)`);
    
    res.status(200).json({
      message: "Migration trạng thái phiếu nhập thành phẩm hoàn tất",
      updated: updatedCount,
      skipped: skippedCount,
      total: allReceipts.length
    });
  } catch (err) {
    console.error("❌ [migrateReceiptStatus] Lỗi:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Hoàn tất chu kỳ sản xuất sau khi tạo phiếu nhập thành phẩm
 * @param {string} phieuQCId - ID của phiếu QC (QCResult)
 * @param {string} receiptId - ID của phiếu nhập thành phẩm (FinishedReceipt)
 * @param {string} authToken - JWT token để authenticate
 */
async function completeProductionCycle(phieuQCId, receiptId, authToken) {
  const headers = authToken ? { Authorization: authToken } : {};

  try {
    console.log(`🔄 [completeProductionCycle] Bắt đầu hoàn tất chu kỳ sản xuất`);
    console.log(`   - Phiếu QC: ${phieuQCId}`);
    console.log(`   - Phiếu nhập kho: ${receiptId}`);
    
    // 1. Lấy planId từ phieuQC sử dụng hàm getPlanIdFromPhieuQC
    const planId = await getPlanIdFromPhieuQC(phieuQCId, authToken);
    
    if (!planId) {
      console.warn("⚠️ [completeProductionCycle] Không tìm thấy kế hoạch từ phiếu QC");
      console.warn(`   - phieuQCId: ${phieuQCId}`);
      return;
    }

    console.log(`📋 [completeProductionCycle] Kế hoạch: ${planId}`);

    // 2. Cập nhật trạng thái lô thành "Hoàn thành" và xác nhận đã cập nhật thành công
    // Sử dụng phieuQCId (QCResult ID) thay vì planId để tìm lô chính xác hơn
    let lotUpdated = false;
    try {
      lotUpdated = await updateLotStatusToCompleted(phieuQCId, receiptId, headers);
      if (lotUpdated) {
        console.log(`✅ [completeProductionCycle] Lô sản xuất đã được cập nhật thành công, tiếp tục reset trạng thái tổ`);
      } else {
        console.warn(`⚠️ [completeProductionCycle] Lô sản xuất chưa được cập nhật, bỏ qua việc reset trạng thái tổ`);
      }
    } catch (lotError) {
      console.error("❌ [completeProductionCycle] Lỗi cập nhật trạng thái lô:", lotError.message);
      console.warn(`⚠️ [completeProductionCycle] Không thể cập nhật lô, bỏ qua việc reset trạng thái tổ`);
    }

    // 3. CHỈ reset trạng thái tổ khi lô đã được cập nhật thành công
    if (lotUpdated) {
      try {
        await resetTeamMemberStatus(planId, headers);
        console.log(`✅ [completeProductionCycle] Đã reset trạng thái tổ về "Active"`);
      } catch (resetError) {
        console.error("❌ [completeProductionCycle] Lỗi reset trạng thái thành viên:", resetError.message);
      }
    } else {
      console.warn(`⚠️ [completeProductionCycle] Bỏ qua việc reset trạng thái tổ vì lô chưa được cập nhật`);
    }

    // 3. Cập nhật kế hoạch trạng thái "Hoàn thành"
    try {
      await axios.put(
        `${GATEWAY_URL}/plan/${planId}`,
        { trangThai: "Hoàn thành" },
        { headers }
      );
      console.log(`✅ Đã cập nhật kế hoạch ${planId} sang trạng thái "Hoàn thành"`);
    } catch (planError) {
      console.error("❌ Lỗi cập nhật kế hoạch:", planError.message);
    }

    // 4. Cập nhật và xóa phân công công việc
    try {
      await completeAndDeleteAssignments(planId, headers);
    } catch (assignError) {
      console.error("❌ Lỗi cập nhật/xóa phân công:", assignError.message);
    }

  } catch (err) {
    console.error("❌ Lỗi trong completeProductionCycle:", err.message);
    throw err;
  }
}

/**
 * Lấy planId từ phieuQC (QCResult ID)
 * @param {string} phieuQCId - ID của phiếu QC (QCResult ID)
 * @param {string} authToken - JWT token
 * @returns {Promise<string|null>} planId hoặc null nếu không tìm thấy
 */
async function getPlanIdFromPhieuQC(phieuQCId, authToken) {
  try {
    const headers = authToken ? { Authorization: authToken } : {};
    
    console.log(`🔍 [getPlanIdFromPhieuQC] Bắt đầu tìm planId từ phieuQC: ${phieuQCId}`);
    
    // Bước 1: Lấy QCResult để tìm QCRequest ID - gọi qua gateway
    let qcResult = null;
    let qcRequestId = null;
    
    try {
      const qcResultsResponse = await axios.get(
        `${GATEWAY_URL}/qc-result`,
        { headers }
      );
      const qcResults = Array.isArray(qcResultsResponse.data) ? qcResultsResponse.data : [];
      console.log(`📊 [getPlanIdFromPhieuQC] Tổng số QCResult: ${qcResults.length}`);
      
      qcResult = qcResults.find(qr => 
        qr._id?.toString() === phieuQCId?.toString()
      );
      
      if (qcResult) {
        console.log(`✅ [getPlanIdFromPhieuQC] Tìm thấy QCResult: ${qcResult._id}`);
        console.log(`📋 [getPlanIdFromPhieuQC] QCResult structure:`, {
          _id: qcResult._id,
          hasQcRequest: !!qcResult.qcRequest,
          qcRequestType: typeof qcResult.qcRequest,
          qcRequestIsObject: typeof qcResult.qcRequest === 'object' && qcResult.qcRequest !== null,
          qcRequestId: qcResult.qcRequest?._id,
          qcRequestString: qcResult.qcRequest?.toString(),
          hasKeHoach: !!qcResult.qcRequest?.keHoach,
          keHoachType: typeof qcResult.qcRequest?.keHoach,
          keHoachValue: qcResult.qcRequest?.keHoach,
        });
        
        qcRequestId = qcResult.qcRequest?._id?.toString() || 
                     qcResult.qcRequest?.toString() || 
                     (typeof qcResult.qcRequest === 'object' && qcResult.qcRequest !== null ? qcResult.qcRequest?._id?.toString() : null);
        
        console.log(`🔑 [getPlanIdFromPhieuQC] qcRequestId extracted: ${qcRequestId}`);
        
        // Thử lấy planId từ qcResult.qcRequest.keHoach nếu có
        if (qcResult.qcRequest?.keHoach) {
          const keHoach = qcResult.qcRequest.keHoach;
          console.log(`📦 [getPlanIdFromPhieuQC] keHoach structure:`, {
            keHoach: keHoach,
            keHoachType: typeof keHoach,
            hasPlanId: !!keHoach?.planId,
            planId: keHoach?.planId,
            hasId: !!keHoach?._id,
            _id: keHoach?._id,
            isString: typeof keHoach === 'string',
            stringValue: typeof keHoach === 'string' ? keHoach : null,
          });
          
          const planId = keHoach?.planId || 
                         keHoach?._id?.toString() || 
                         (typeof keHoach === 'string' ? keHoach : null);
          
          if (planId) {
            console.log(`✅ [getPlanIdFromPhieuQC] Tìm thấy planId từ QCResult.keHoach: ${planId}`);
            return planId.toString();
          } else {
            console.warn(`⚠️ [getPlanIdFromPhieuQC] QCResult có keHoach nhưng không extract được planId`);
          }
        } else {
          console.warn(`⚠️ [getPlanIdFromPhieuQC] QCResult không có keHoach trong qcRequest`);
        }
      } else {
        console.warn(`⚠️ [getPlanIdFromPhieuQC] Không tìm thấy QCResult với ID: ${phieuQCId}`);
        console.log(`📋 [getPlanIdFromPhieuQC] Danh sách QCResult IDs:`, qcResults.map(qr => qr._id?.toString()).slice(0, 5));
      }
    } catch (resultErr) {
      console.error(`❌ [getPlanIdFromPhieuQC] Lỗi lấy QCResult:`, resultErr.message);
      if (resultErr.response) {
        console.error(`   Status: ${resultErr.response.status}, Data:`, resultErr.response.data);
      }
    }
    
    // Bước 2: Nếu không tìm thấy planId từ QCResult, gọi trực tiếp đến QCRequest
    if (qcRequestId) {
      try {
        console.log(`🔍 [getPlanIdFromPhieuQC] Gọi QCRequest API để lấy keHoach: ${qcRequestId}`);
        const qcRequestResponse = await axios.get(
          `${GATEWAY_URL}/qc-request/${qcRequestId}`,
          { headers }
        );
        const qcRequest = qcRequestResponse.data;
        
        console.log(`📋 [getPlanIdFromPhieuQC] QCRequest structure:`, {
          _id: qcRequest?._id,
          hasKeHoach: !!qcRequest?.keHoach,
          keHoachType: typeof qcRequest?.keHoach,
          keHoachValue: qcRequest?.keHoach,
        });
        
        if (qcRequest && qcRequest.keHoach) {
          const keHoach = qcRequest.keHoach;
          console.log(`📦 [getPlanIdFromPhieuQC] QCRequest.keHoach structure:`, {
            keHoach: keHoach,
            keHoachType: typeof keHoach,
            hasPlanId: !!keHoach?.planId,
            planId: keHoach?.planId,
            hasId: !!keHoach?._id,
            _id: keHoach?._id,
            isString: typeof keHoach === 'string',
            stringValue: typeof keHoach === 'string' ? keHoach : null,
            fullObject: JSON.stringify(keHoach, null, 2),
          });
          
          const planId = keHoach?.planId || 
                        keHoach?._id?.toString() || 
                        (typeof keHoach === 'string' ? keHoach : null);
          
          if (planId) {
            console.log(`✅ [getPlanIdFromPhieuQC] Tìm thấy planId từ QCRequest.keHoach: ${planId}`);
            return planId.toString();
          } else {
            console.warn(`⚠️ [getPlanIdFromPhieuQC] QCRequest có keHoach nhưng không extract được planId`);
            console.warn(`   Full keHoach object:`, JSON.stringify(keHoach, null, 2));
          }
        } else {
          console.warn(`⚠️ [getPlanIdFromPhieuQC] QCRequest không có keHoach`);
          console.warn(`   QCRequest keys:`, qcRequest ? Object.keys(qcRequest) : 'null');
        }
      } catch (requestErr) {
        console.error(`❌ [getPlanIdFromPhieuQC] Lỗi lấy QCRequest:`, requestErr.message);
        if (requestErr.response) {
          console.error(`   Status: ${requestErr.response.status}, Data:`, requestErr.response.data);
        }
      }
    } else {
      console.warn(`⚠️ [getPlanIdFromPhieuQC] Không có qcRequestId để gọi QCRequest API`);
    }
    
    // Bước 3: Fallback - Tìm planId từ WorkAssignment hoặc LoSanXuat dựa trên thông tin QCRequest
    if (qcRequestId) {
      try {
        console.log(`🔍 [getPlanIdFromPhieuQC] Fallback: Tìm planId từ WorkAssignment/LoSanXuat...`);
        
        // Lấy thông tin QCRequest để có xuong, loSanXuat, sanPhamName
        const qcRequestResponse = await axios.get(
          `${GATEWAY_URL}/qc-request/${qcRequestId}`,
          { headers }
        );
        const qcRequest = qcRequestResponse.data;
        
        if (qcRequest) {
          console.log(`📋 [getPlanIdFromPhieuQC] QCRequest info for fallback:`, {
            xuong: qcRequest.xuong,
            loSanXuat: qcRequest.loSanXuat,
            sanPhamName: qcRequest.sanPhamName,
          });
          
          // Thử tìm từ LoSanXuat theo loSanXuat (tên tổ)
          if (qcRequest.loSanXuat) {
            try {
              const lotsResponse = await axios.get(
                `${GATEWAY_URL}/factory/api/lot`,
                { headers }
              );
              const lots = Array.isArray(lotsResponse.data) ? lotsResponse.data : [];
              
              // Tìm lô có toSanXuat.tenTo khớp với loSanXuat
              const matchingLot = lots.find(lot => {
                const lotTenTo = lot.toSanXuat?.tenTo || lot.toSanXuat?.tenTo || "";
                return lotTenTo.toLowerCase().includes(qcRequest.loSanXuat.toLowerCase()) ||
                       qcRequest.loSanXuat.toLowerCase().includes(lotTenTo.toLowerCase());
              });
              
              if (matchingLot && matchingLot.keHoach?.planId) {
                const planId = matchingLot.keHoach.planId;
                console.log(`✅ [getPlanIdFromPhieuQC] Tìm thấy planId từ LoSanXuat (fallback): ${planId}`);
                return planId.toString();
              }
            } catch (lotErr) {
              console.error(`❌ [getPlanIdFromPhieuQC] Lỗi tìm từ LoSanXuat:`, lotErr.message);
            }
          }
          
          // Thử tìm từ WorkAssignment theo xuong và sanPhamName
          if (qcRequest.xuong || qcRequest.sanPhamName) {
            try {
              const assignmentsResponse = await axios.get(
                `${GATEWAY_URL}/factory/manager/assignments`,
                { headers }
              );
              const assignments = Array.isArray(assignmentsResponse.data) ? assignmentsResponse.data : [];
              
              // Tìm assignment gần đây nhất có xuong hoặc sanPham khớp
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
              
              if (matchingAssignment && matchingAssignment.keHoach?.planId) {
                const planId = matchingAssignment.keHoach.planId;
                console.log(`✅ [getPlanIdFromPhieuQC] Tìm thấy planId từ WorkAssignment (fallback): ${planId}`);
                return planId.toString();
              }
            } catch (assignErr) {
              console.error(`❌ [getPlanIdFromPhieuQC] Lỗi tìm từ WorkAssignment:`, assignErr.message);
            }
          }
        }
      } catch (fallbackErr) {
        console.error(`❌ [getPlanIdFromPhieuQC] Lỗi fallback:`, fallbackErr.message);
      }
    }
    
    console.warn(`⚠️ [getPlanIdFromPhieuQC] Không tìm thấy planId từ phieuQC: ${phieuQCId}`);
    return null;
  } catch (err) {
    console.error("❌ [getPlanIdFromPhieuQC] Lỗi tổng quát:", err.message);
    console.error("   Stack:", err.stack);
    return null;
  }
}

/**
 * Cập nhật trạng thái lô thành "Hoàn thành" khi tạo đơn nhập thành phẩm
 * Tìm lô bằng phieuQC (QCRequest ID) thay vì planId để đảm bảo chính xác hơn
 * @param {string} phieuQCId - ID của phiếu QC (QCResult ID từ FinishedReceipt)
 * @param {string} receiptId - ID của phiếu nhập thành phẩm (FinishedReceipt)
 * @param {object} headers - HTTP headers với authorization token
 * @returns {Promise<boolean>} true nếu cập nhật thành công, false nếu không tìm thấy lô hoặc lỗi
 */
async function updateLotStatusToCompleted(phieuQCId, receiptId, headers) {
  try {
    console.log(`🔍 [updateLotStatusToCompleted] Tìm lô bằng phieuQC: ${phieuQCId}`);
    console.log(`   - Phiếu nhập kho: ${receiptId}`);
    
    // Bước 1: Lấy QCResult để tìm QCRequest ID
    let qcRequestId = null;
    try {
      const qcResultsResponse = await axios.get(
        `${GATEWAY_URL}/qc-result`,
        { headers }
      );
      const qcResults = Array.isArray(qcResultsResponse.data) ? qcResultsResponse.data : [];
      const qcResult = qcResults.find(qr => 
        qr._id?.toString() === phieuQCId?.toString()
      );
      
      if (qcResult && qcResult.qcRequest) {
        qcRequestId = qcResult.qcRequest._id?.toString() || qcResult.qcRequest?.toString();
        console.log(`✅ [updateLotStatusToCompleted] Tìm thấy QCRequest ID: ${qcRequestId}`);
      } else {
        console.warn(`⚠️ [updateLotStatusToCompleted] Không tìm thấy QCResult hoặc QCRequest với phieuQC: ${phieuQCId}`);
        // Fallback: Thử dùng phieuQCId trực tiếp như QCRequest ID
        qcRequestId = phieuQCId?.toString();
        console.log(`🔄 [updateLotStatusToCompleted] Fallback: Dùng phieuQCId trực tiếp: ${qcRequestId}`);
      }
    } catch (qcErr) {
      console.error(`❌ [updateLotStatusToCompleted] Lỗi lấy QCResult:`, qcErr.message);
      // Fallback: Thử dùng phieuQCId trực tiếp như QCRequest ID
      qcRequestId = phieuQCId?.toString();
      console.log(`🔄 [updateLotStatusToCompleted] Fallback sau lỗi: Dùng phieuQCId trực tiếp: ${qcRequestId}`);
    }
    
    if (!qcRequestId) {
      console.error(`❌ [updateLotStatusToCompleted] Không thể xác định QCRequest ID`);
      return false;
    }
    
    // Bước 2: Tìm lô theo phieuQC (QCRequest ID)
    // Lấy tất cả lô và filter theo phieuQC
    const lotsResponse = await axios.get(
      `${GATEWAY_URL}/factory/api/lot`,
      { headers }
    );
    
    const allLots = Array.isArray(lotsResponse.data) ? lotsResponse.data : [];
    console.log(`📦 [updateLotStatusToCompleted] Tổng số lô: ${allLots.length}`);
    
    // Tìm lô có phieuQC khớp với QCRequest ID
    const lot = allLots.find(l => {
      const lotPhieuQC = l.phieuQC?.toString();
      const match = lotPhieuQC === qcRequestId;
      if (match) {
        console.log(`✅ [updateLotStatusToCompleted] Tìm thấy lô khớp:`, {
          _id: l._id,
          maLo: l.maLo,
          phieuQC: l.phieuQC,
          trangThai: l.trangThai
        });
      }
      return match;
    });
    
    // Nếu không tìm thấy bằng phieuQC, thử tìm bằng planId (fallback)
    if (!lot) {
      console.warn(`⚠️ [updateLotStatusToCompleted] Không tìm thấy lô bằng phieuQC, thử tìm bằng planId...`);
      
      // Lấy planId từ QCRequest
      try {
        const qcRequestResponse = await axios.get(
          `${GATEWAY_URL}/qc-request/${qcRequestId}`,
          { headers }
        );
        const qcRequest = qcRequestResponse.data;
        const planId = qcRequest?.keHoach?.planId?.toString() || qcRequest?.keHoach?.toString();
        
        if (planId) {
          console.log(`🔄 [updateLotStatusToCompleted] Fallback: Tìm lô bằng planId: ${planId}`);
          const fallbackLot = allLots.find(l => {
            const lotPlanId = l.keHoach?.planId?.toString() || l.keHoach?.planId;
            return lotPlanId === planId;
          });
          
          if (fallbackLot) {
            console.log(`✅ [updateLotStatusToCompleted] Tìm thấy lô bằng planId (fallback): ${fallbackLot.maLo || fallbackLot._id}`);
            // Cập nhật lô này
            const updateResponse = await axios.put(
              `${GATEWAY_URL}/factory/api/lot/${fallbackLot._id}`,
              { 
                trangThai: "Hoan thanh",
                phieuNhapKho: receiptId,
                phieuQC: qcRequestId // Cập nhật phieuQC nếu chưa có
              },
              { headers }
            );
            
            const updatedLot = updateResponse.data?.lot || updateResponse.data;
            if (updatedLot && (updatedLot.trangThai === "Hoan thanh" || updatedLot.trangThai === "Hoàn thành")) {
              console.log(`✅ [updateLotStatusToCompleted] Đã cập nhật lô ${fallbackLot.maLo || fallbackLot._id} thành "Hoàn thành" (fallback)`);
              return true;
            }
          }
        }
      } catch (fallbackErr) {
        console.error(`❌ [updateLotStatusToCompleted] Lỗi fallback:`, fallbackErr.message);
      }
      
      console.warn(`⚠️ [updateLotStatusToCompleted] Không tìm thấy lô sản xuất với phieuQC: ${qcRequestId}`);
      return false;
    }
    
    // Bước 3: Cập nhật trạng thái lô thành "Hoàn thành" và lưu ID phiếu nhập kho
    console.log(`✅ [updateLotStatusToCompleted] Tìm thấy lô: ${lot.maLo || lot._id}, trạng thái hiện tại: ${lot.trangThai}`);
    
    const updateResponse = await axios.put(
      `${GATEWAY_URL}/factory/api/lot/${lot._id}`,
      { 
        trangThai: "Hoan thanh",
        phieuNhapKho: receiptId // Lưu ID phiếu nhập kho (FinishedReceipt)
      },
      { headers }
    );
    
    // Xác minh lô đã được cập nhật thành công
    const updatedLot = updateResponse.data?.lot || updateResponse.data;
    console.log(`🔍 [updateLotStatusToCompleted] Response từ update lot:`, {
      status: updateResponse.status,
      data: updateResponse.data,
      updatedLot: updatedLot,
      trangThai: updatedLot?.trangThai
    });
    
    if (updatedLot && (updatedLot.trangThai === "Hoan thanh" || updatedLot.trangThai === "Hoàn thành")) {
      console.log(`✅ [updateLotStatusToCompleted] Đã cập nhật trạng thái lô ${lot.maLo || lot._id} thành "Hoàn thành"`, {
        updatedLot: {
          _id: updatedLot._id,
          maLo: updatedLot.maLo,
          trangThai: updatedLot.trangThai,
          phieuNhapKho: updatedLot.phieuNhapKho
        }
      });
      return true; // Trả về true để báo cập nhật thành công
    } else {
      console.warn(`⚠️ [updateLotStatusToCompleted] Lô được cập nhật nhưng trạng thái không đúng:`, updatedLot?.trangThai);
      return false;
    }
  } catch (err) {
    console.error("❌ [updateLotStatusToCompleted] Lỗi:", err.message);
    console.error("❌ [updateLotStatusToCompleted] Stack:", err.stack);
    if (err.response) {
      console.error("❌ [updateLotStatusToCompleted] Response error:", {
        status: err.response.status,
        data: err.response.data
      });
    }
    return false; // Trả về false khi có lỗi
  }
}

/**
 * Reset trạng thái hoàn thành của tất cả thành viên trong các tổ của kế hoạch
 * và chuyển trạng thái tổ về "Active" (mặc định)
 */
async function resetTeamMemberStatus(planId, headers) {
  try {
    console.log(`🔍 [resetTeamMemberStatus] Bắt đầu reset trạng thái công nhân cho kế hoạch: ${planId}`);
    console.log(`   Headers:`, headers ? { hasAuth: !!headers.Authorization, authType: typeof headers.Authorization } : 'no headers');
    
    // Đảm bảo headers có Authorization
    if (!headers || !headers.Authorization) {
      console.warn(`⚠️ [resetTeamMemberStatus] Không có Authorization header, bỏ qua reset`);
      return;
    }
    
    // Lấy tất cả phân công của kế hoạch
    const assignmentsResponse = await axios.get(
      `${GATEWAY_URL}/factory/manager/assignments`,
      { headers, params: { planId } }
    );

    const assignments = Array.isArray(assignmentsResponse.data) ? assignmentsResponse.data : [];
    
    // Lấy danh sách ID tổ từ các phân công
    const teamIds = new Set();
    assignments.forEach(assignment => {
      if (assignment.congViec && Array.isArray(assignment.congViec)) {
        assignment.congViec.forEach(cv => {
          if (cv.to?.id) {
            teamIds.add(cv.to.id.toString());
          }
        });
      }
    });

    // Reset trạng thái hoàn thành cho từng tổ
    for (const teamId of teamIds) {
      try {
        const teamResponse = await axios.get(
          `${GATEWAY_URL}/factory/to/${teamId}`,
          { headers }
        );
        
        const team = teamResponse.data;
        if (team && team.thanhVien && Array.isArray(team.thanhVien)) {
          // Reset hoanThanh về false cho tất cả thành viên
          team.thanhVien.forEach(member => {
            member.hoanThanh = false;
            member.ngayXacNhan = null;
          });

          // Cập nhật tổ: reset trạng thái thành viên và chuyển trạng thái tổ về "Active"
          await axios.put(
            `${GATEWAY_URL}/factory/to/${teamId}`,
            { 
              thanhVien: team.thanhVien,
              trangThai: "Active" // Chuyển về trạng thái mặc định
            },
            { headers }
          );
          
          console.log(`✅ Đã reset trạng thái thành viên và chuyển tổ ${team.tenTo || teamId} về "Active"`);
        }
      } catch (teamError) {
        console.error(`❌ Lỗi reset tổ ${teamId}:`, teamError.message);
      }
    }
  } catch (err) {
    console.error("❌ Lỗi resetTeamMemberStatus:", err.message);
    throw err;
  }
}

/**
 * Cập nhật và xóa phân công công việc của kế hoạch
 */
async function completeAndDeleteAssignments(planId, headers) {
  try {
    // Lấy tất cả phân công của kế hoạch
    const assignmentsResponse = await axios.get(
      `${GATEWAY_URL}/factory/manager/assignments`,
      { headers, params: { planId } }
    );

    const assignments = Array.isArray(assignmentsResponse.data) ? assignmentsResponse.data : [];

    // Cập nhật trạng thái "Hoàn thành" cho tất cả phân công
    for (const assignment of assignments) {
      try {
        await axios.put(
          `${GATEWAY_URL}/factory/manager/assignments/${assignment._id || assignment.id}`,
          { trangThai: "Hoan thanh" },
          { headers }
        );
        console.log(`✅ Đã cập nhật phân công ${assignment.maPhanCong || assignment._id} sang "Hoàn thành"`);
      } catch (updateError) {
        console.error(`❌ Lỗi cập nhật phân công ${assignment._id}:`, updateError.message);
      }
    }

    // Xóa tất cả phân công (gọi API xóa theo planId)
    try {
      await axios.delete(
        `${GATEWAY_URL}/factory/manager/assignments/plan/${planId}`,
        { headers }
      );
      console.log(`✅ Đã xóa tất cả phân công của kế hoạch ${planId}`);
    } catch (deleteError) {
      console.error("❌ Lỗi xóa phân công:", deleteError.message);
      // Nếu không có API xóa theo planId, xóa từng cái
      for (const assignment of assignments) {
        try {
          await axios.delete(
            `${GATEWAY_URL}/factory/manager/assignments/${assignment._id || assignment.id}`,
            { headers }
          );
        } catch (delError) {
          console.error(`❌ Lỗi xóa phân công ${assignment._id}:`, delError.message);
        }
      }
    }
  } catch (err) {
    console.error("❌ Lỗi completeAndDeleteAssignments:", err.message);
    throw err;
  }
}

/**
 * Xác nhận nhập kho thành phẩm (chỉ kho thành phẩm mới có quyền)
 */
exports.confirmReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role?.toLowerCase() || '';

    // Chỉ kho thành phẩm (khotp) mới có quyền xác nhận
    if (userRole !== 'khotp' && userRole !== 'admin') {
      return res.status(403).json({ 
        error: "Chỉ quản lý kho thành phẩm mới có quyền xác nhận nhập kho" 
      });
    }

    // Tìm phiếu nhập
    const receipt = await FinishedReceipt.findById(id);
    if (!receipt) {
      return res.status(404).json({ error: "Không tìm thấy phiếu nhập thành phẩm" });
    }

    // Kiểm tra trạng thái hiện tại
    if (receipt.trangThai === "Da nhap kho") {
      return res.status(400).json({ 
        error: "Phiếu nhập đã được xác nhận nhập kho rồi" 
      });
    }

    if (receipt.trangThai === "Da huy") {
      return res.status(400).json({ 
        error: "Không thể xác nhận phiếu nhập đã bị hủy" 
      });
    }

    // Cập nhật trạng thái thành "Da nhap kho"
    receipt.trangThai = "Da nhap kho";
    receipt.ngayNhap = new Date(); // Cập nhật ngày nhập
    await receipt.save();

    // Tăng số lượng sản phẩm trong kho
    if (receipt.sanPhamName && receipt.soLuong > 0) {
      try {
        // Tìm sản phẩm theo tên từ sales-service
        const token = req.headers.authorization;
        const headers = token ? { Authorization: token } : {};
        
        // Lấy danh sách thành phẩm
        const productsResponse = await axios.get(`${GATEWAY_URL}/products/finished`, { headers });
        const products = Array.isArray(productsResponse.data) ? productsResponse.data : [];
        
        // Tìm sản phẩm theo tên (so khớp chính xác hoặc gần đúng)
        const product = products.find(p => {
          const productName = (p.tenSP || p.tenSanPham || '').trim();
          const receiptName = (receipt.sanPhamName || '').trim();
          return productName.toLowerCase() === receiptName.toLowerCase() || 
                 productName.includes(receiptName) || 
                 receiptName.includes(productName);
        });

        if (product && product._id) {
          // Tăng số lượng sản phẩm trong kho
          await updateProductQuantity(product._id, receipt.soLuong, token);
          console.log(`✅ Đã tăng số lượng sản phẩm "${receipt.sanPhamName}" trong kho: +${receipt.soLuong}`);
        } else {
          console.warn(`⚠️ Không tìm thấy sản phẩm với tên "${receipt.sanPhamName}" trong kho để cập nhật số lượng`);
        }
      } catch (quantityError) {
        console.error("❌ Lỗi cập nhật số lượng sản phẩm trong kho:", quantityError.message);
        // Không block response nếu lỗi cập nhật số lượng
      }
    }

    // Sau khi xác nhận nhập kho, hoàn tất chu kỳ sản xuất
    try {
      await completeProductionCycle(receipt.phieuQC, receipt._id.toString(), req.headers.authorization);
      console.log(`✅ Đã hoàn tất chu kỳ sản xuất cho phiếu QC: ${receipt.phieuQC}`);
    } catch (cycleError) {
      console.error("❌ Lỗi hoàn tất chu kỳ sản xuất:", cycleError.message);
      // Không block response nếu lỗi
    }

    res.status(200).json({
      message: "Đã xác nhận nhập kho thành công",
      receipt,
    });
  } catch (err) {
    console.error("❌ [confirmReceipt] Error:", err);
    res.status(500).json({ error: err.message });
  }
};
