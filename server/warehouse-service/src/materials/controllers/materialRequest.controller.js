const MaterialRequest = require("../../models/MaterialRequest");

/**
 * Lấy danh sách phiếu yêu cầu NVL
 */
exports.getMaterialRequests = async (req, res) => {
  try {
    const { trangThai } = req.query;
    const filter = {};
    
    // Lấy tất cả requests để debug (trước khi filter)
    const allRequests = await MaterialRequest.find({}).sort({ createdAt: -1 });
    console.log(`📊 [warehouse-service] Total material requests in DB: ${allRequests.length}`);
    if (allRequests.length > 0) {
      console.log("📋 [warehouse-service] All request statuses:", allRequests.map(r => ({ 
        id: r._id, 
        status: r.trangThai, 
        maPhieu: r.maPhieu,
        keHoach: r.keHoach 
      })));
    } else {
      console.log("⚠️ [warehouse-service] No material requests found in database");
    }
    
    if (trangThai) {
      filter.trangThai = trangThai;
      console.log(`🔍 [warehouse-service] Filtering by status: "${trangThai}"`);
    } else {
      console.log("🔍 [warehouse-service] No status filter, returning all requests");
    }
    
    const requests = await MaterialRequest.find(filter)
      .sort({ createdAt: -1 });
    
    console.log(`✅ [warehouse-service] Found ${requests.length} material requests matching filter:`, JSON.stringify(filter));
    
    res.status(200).json(requests);
  } catch (err) {
    console.error("❌ Error fetching material requests:", err.message);
    console.error("❌ Stack:", err.stack);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Lấy chi tiết phiếu yêu cầu NVL theo ID
 */
exports.getMaterialRequestById = async (req, res) => {
  try {
    const request = await MaterialRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: "Không tìm thấy phiếu yêu cầu NVL" });
    }
    
    res.status(200).json(request);
  } catch (err) {
    console.error("❌ Error fetching material request by ID:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Director duyệt phiếu yêu cầu NVL
 */
exports.approveMaterialRequest = async (req, res) => {
  try {
    const user = req.user;
    const request = await MaterialRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: "Không tìm thấy phiếu yêu cầu NVL" });
    }
    
    if (request.trangThai !== "Chờ phê duyệt") {
      return res.status(400).json({ 
        message: `Không thể duyệt phiếu. Trạng thái hiện tại: ${request.trangThai}` 
      });
    }
    
    request.trangThai = "Đã duyệt";
    request.nguoiDuyet = user.username || user.email || user.id;
    request.ngayDuyet = new Date();
    await request.save();
    
    res.status(200).json({
      message: "Đã duyệt phiếu yêu cầu NVL thành công",
      request: await MaterialRequest.findById(req.params.id)
    });
  } catch (err) {
    console.error("❌ Error approving material request:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Tạo phiếu yêu cầu NVL mới
 */
exports.createMaterialRequest = async (req, res) => {
  try {
    const { keHoach, danhSachNVL, nguoiTao } = req.body;
    
    const request = await MaterialRequest.create({
      keHoach: keHoach,
      danhSachNVL: danhSachNVL || [],
      nguoiTao: nguoiTao || req.user?.id,
      trangThai: "Chờ phê duyệt",
      ngayYeuCau: new Date(),
    });
    
    res.status(201).json({
      message: "Đã tạo phiếu yêu cầu NVL thành công",
      request: await MaterialRequest.findById(request._id)
    });
  } catch (err) {
    console.error("❌ Error creating material request:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Director từ chối phiếu yêu cầu NVL
 */
exports.rejectMaterialRequest = async (req, res) => {
  try {
    const { ghiChu, reason } = req.body;
    const user = req.user;
    const request = await MaterialRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: "Không tìm thấy phiếu yêu cầu NVL" });
    }
    
    if (request.trangThai !== "Chờ phê duyệt") {
      return res.status(400).json({ 
        message: `Không thể từ chối phiếu. Trạng thái hiện tại: ${request.trangThai}` 
      });
    }
    
    request.trangThai = "Từ chối";
    request.ghiChu = ghiChu || reason || "Không có lý do";
    request.nguoiDuyet = user.username || user.email || user.id;
    request.ngayDuyet = new Date();
    await request.save();
    
    res.status(200).json({
      message: "Đã từ chối phiếu yêu cầu NVL",
      request: await MaterialRequest.findById(req.params.id)
    });
  } catch (err) {
    console.error("❌ Error rejecting material request:", err.message);
    res.status(500).json({ error: err.message });
  }
};

