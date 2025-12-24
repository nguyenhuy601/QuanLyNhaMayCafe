const axios = require('axios');
const { publishEvent } = require("../utils/eventPublisher");

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://api-gateway:4000';

/**
 * Tự động tạo lô sản xuất khi bắt đầu kế hoạch
 */
async function createLotForPlan(plan, user) {
  const LoSanXuat = require("../models/LoSanXuat");
  const WorkAssignment = require("../models/WorkAssignment");
  const ToSanXuat = require("../models/ToSanXuat");
  const XuongSanXuat = require("../models/XuongSanXuat");

  // Lấy thông tin sản phẩm từ kế hoạch
  const productInfo = plan.sanPham || {};
  
  // Tìm WorkAssignment của kế hoạch này để lấy thông tin xưởng và tổ
  const assignment = await WorkAssignment.findOne({
    "keHoach.planId": plan._id?.toString() || plan.id?.toString(),
    trangThai: { $in: ["Dang thuc hien", "Cho xac nhan", "Hoan thanh"] }
  }).sort({ createdAt: -1 });

  let xuongInfo = null;
  let toInfo = null;
  let nhomSanPham = "khac";
  let nguyenLieu = "";

  if (assignment) {
    xuongInfo = assignment.xuong || {};
    
    // Lấy tổ đầu tiên từ công việc (thường là tổ Chuẩn bị & Phối trộn)
    if (assignment.congViec && assignment.congViec.length > 0) {
      const firstCongViec = assignment.congViec[0];
      const toId = firstCongViec.to?.id;
      
      if (toId) {
        const to = await ToSanXuat.findById(toId);
        if (to) {
          toInfo = {
            id: to._id.toString(),
            maTo: to.maTo || null,
            tenTo: to.tenTo || "Chưa xác định",
          };
          nhomSanPham = to.nhomSanPham || "khac";
          nguyenLieu = to.nguyenLieu || "";
        }
      }
    }
  } else {
    // Nếu không có assignment, lấy thông tin xưởng từ kế hoạch hoặc user
    if (plan.xuongPhuTrach) {
      // Tìm xưởng theo tên từ kế hoạch
      const xuong = await XuongSanXuat.findOne({ 
        tenXuong: plan.xuongPhuTrach 
      });
      if (xuong) {
        xuongInfo = {
          id: xuong._id.toString(),
          tenXuong: xuong.tenXuong || plan.xuongPhuTrach,
        };
      } else {
        // Nếu không tìm thấy, dùng tên từ kế hoạch
        xuongInfo = {
          id: null,
          tenXuong: plan.xuongPhuTrach,
        };
      }
    } else if (user?.xuongInfo) {
      xuongInfo = user.xuongInfo;
    }
  }

  // Tạo ngày sản xuất (ngày hiện tại)
  const ngaySanXuat = new Date();
  
  // Tạo hạn sử dụng (2 năm sau)
  const hanSuDung = new Date(ngaySanXuat);
  hanSuDung.setFullYear(hanSuDung.getFullYear() + 2);

  // Tạo lô sản xuất
  const lo = new LoSanXuat({
    sanPham: {
      productId: productInfo.productId || productInfo._id?.toString() || null,
      maSP: productInfo.maSP || productInfo.maSanPham || null,
      tenSanPham: productInfo.tenSanPham || productInfo.tenSP || plan.tenSanPham || "Chưa xác định",
      loai: productInfo.loai || nhomSanPham,
    },
    nhomSanPham: nhomSanPham,
    nguyenLieu: nguyenLieu,
    soLuong: plan.soLuongCanSanXuat || 0, // Số lượng ban đầu từ kế hoạch
    ngaySanXuat: ngaySanXuat,
    hanSuDung: hanSuDung,
    xuong: {
      id: xuongInfo?.id || null,
      tenXuong: xuongInfo?.tenXuong || "Chưa xác định",
    },
    toSanXuat: toInfo || null,
    keHoach: {
      planId: plan._id?.toString() || plan.id?.toString() || null,
      maKeHoach: plan.maKeHoach || plan.maKH || null,
    },
    nguoiTao: {
      id: user?.id || user?._id?.toString() || "system",
      hoTen: user?.hoTen || user?.username || "Hệ thống",
      email: user?.email || "system@factory.com",
    },
    trangThai: "Da tao",
    ghiChu: `Tự động tạo khi bắt đầu kế hoạch ${plan.maKeHoach || plan.maKH || planId}`,
  });

  await lo.save();
  console.log(`✅ Đã tạo lô sản xuất: ${lo.maLo} - Số lượng: ${lo.soLuong}`);
  
  return lo;
}

/**
 * Xưởng trưởng duyệt kế hoạch sản xuất
 * Chỉ duyệt được kế hoạch có sản phẩm trong danh sách phụ trách
 */
exports.approvePlan = async (req, res) => {
  try {
    const planId = req.params.id;
    const user = req.user;
    
    // Kiểm tra quyền: chỉ xưởng trưởng mới được duyệt
    if (user.role !== 'xuongtruong' && user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Chỉ xưởng trưởng mới được duyệt kế hoạch' 
      });
    }

    // Lấy thông tin kế hoạch
    const token = req.headers.authorization;
    const headers = { Authorization: token };
    
    const planResponse = await axios.get(`${GATEWAY_URL}/plan/${planId}`, { headers });
    const plan = planResponse.data;

    // Kiểm tra xem kế hoạch có thuộc xưởng phụ trách không
    if (user.role === 'xuongtruong' && user.sanPhamPhuTrach?.length > 0) {
      const productIds = user.sanPhamPhuTrach.map(sp => sp.productId).filter(Boolean);
      if (!productIds.includes(plan.sanPham?.productId)) {
        return res.status(403).json({ 
          message: 'Bạn không có quyền duyệt kế hoạch này. Kế hoạch không thuộc sản phẩm bạn phụ trách.' 
        });
      }
    }

    // Kiểm tra trạng thái hiện tại
    if (plan.trangThai !== 'Chờ xưởng trưởng duyệt') {
      return res.status(400).json({ 
        message: `Không thể duyệt kế hoạch. Trạng thái hiện tại: ${plan.trangThai}` 
      });
    }

    // Cập nhật kế hoạch: xưởng trưởng đã duyệt
    const updatePayload = {
      trangThai: 'Đã xưởng trưởng duyệt',
      nguoiDuyetXuongTruong: user.username || user.email || user.hoTen || 'xuongtruong',
      ngayDuyetXuongTruong: new Date().toISOString(),
    };

    const updateResponse = await axios.put(
      `${GATEWAY_URL}/plan/${planId}`, 
      updatePayload, 
      { headers }
    );

    // Gửi event
    await publishEvent('PLAN_APPROVED_BY_XUONGTRUONG', {
      planId: planId,
      plan: updateResponse.data.plan || updateResponse.data,
      approvedBy: user.username || user.email,
    });

    res.status(200).json({
      message: 'Đã duyệt kế hoạch thành công. Kế hoạch đang chờ giám đốc duyệt.',
      plan: updateResponse.data.plan || updateResponse.data,
    });
  } catch (error) {
    console.error('❌ Error approving plan:', error.message);
    if (error.response) {
      return res.status(error.response.status).json({ 
        error: error.response.data?.message || error.response.data?.error || 'Lỗi khi duyệt kế hoạch' 
      });
    }
    res.status(500).json({ error: 'Lỗi khi duyệt kế hoạch', message: error.message });
  }
};

/**
 * Xưởng trưởng từ chối kế hoạch
 */
exports.rejectPlan = async (req, res) => {
  try {
    const planId = req.params.id;
    const { reason } = req.body;
    const user = req.user;
    
    // Kiểm tra quyền
    if (user.role !== 'xuongtruong' && user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Chỉ xưởng trưởng mới được từ chối kế hoạch' 
      });
    }

    // Lấy thông tin kế hoạch
    const token = req.headers.authorization;
    const headers = { Authorization: token };
    
    const planResponse = await axios.get(`${GATEWAY_URL}/plan/${planId}`, { headers });
    const plan = planResponse.data;

    // Kiểm tra quyền phụ trách
    if (user.role === 'xuongtruong' && user.sanPhamPhuTrach?.length > 0) {
      const productIds = user.sanPhamPhuTrach.map(sp => sp.productId).filter(Boolean);
      if (!productIds.includes(plan.sanPham?.productId)) {
        return res.status(403).json({ 
          message: 'Bạn không có quyền từ chối kế hoạch này.' 
        });
      }
    }

    // Kiểm tra trạng thái
    if (plan.trangThai !== 'Chờ xưởng trưởng duyệt') {
      return res.status(400).json({ 
        message: `Không thể từ chối kế hoạch. Trạng thái hiện tại: ${plan.trangThai}` 
      });
    }

    // Cập nhật kế hoạch: từ chối
    const updatePayload = {
      trangThai: 'Từ chối',
      ghiChu: reason ? `Từ chối bởi xưởng trưởng: ${reason}` : 'Từ chối bởi xưởng trưởng',
    };

    const updateResponse = await axios.put(
      `${GATEWAY_URL}/plan/${planId}`, 
      updatePayload, 
      { headers }
    );

    // Gửi event
    await publishEvent('PLAN_REJECTED_BY_XUONGTRUONG', {
      planId: planId,
      plan: updateResponse.data.plan || updateResponse.data,
      rejectedBy: user.username || user.email,
      reason: reason,
    });

    res.status(200).json({
      message: 'Đã từ chối kế hoạch thành công.',
      plan: updateResponse.data.plan || updateResponse.data,
    });
  } catch (error) {
    console.error('❌ Error rejecting plan:', error.message);
    if (error.response) {
      return res.status(error.response.status).json({ 
        error: error.response.data?.message || error.response.data?.error || 'Lỗi khi từ chối kế hoạch' 
      });
    }
    res.status(500).json({ error: 'Lỗi khi từ chối kế hoạch', message: error.message });
  }
};

/**
 * Xưởng trưởng xem danh sách kế hoạch chờ duyệt (của xưởng mình)
 */
exports.getPendingPlans = async (req, res) => {
  try {
    const user = req.user;
    const token = req.headers.authorization;
    const headers = { Authorization: token };

    // Lấy tất cả kế hoạch
    const plansResponse = await axios.get(`${GATEWAY_URL}/plan`, { headers });
    let plans = Array.isArray(plansResponse.data) ? plansResponse.data : [];

    // Lọc kế hoạch chờ xưởng trưởng duyệt
    plans = plans.filter(plan => plan.trangThai === 'Chờ xưởng trưởng duyệt');

    // Nếu là xưởng trưởng, chỉ hiển thị kế hoạch có sản phẩm trong danh sách phụ trách
    if (user.role === 'xuongtruong' && user.sanPhamPhuTrach?.length > 0) {
      const productIds = user.sanPhamPhuTrach.map(sp => sp.productId).filter(Boolean);
      plans = plans.filter(plan => productIds.includes(plan.sanPham?.productId));
    }

    res.status(200).json(plans);
  } catch (error) {
    console.error('❌ Error fetching pending plans:', error.message);
    if (error.response) {
      return res.status(error.response.status).json({ 
        error: error.response.data?.message || error.response.data?.error || 'Lỗi khi lấy danh sách kế hoạch' 
      });
    }
    res.status(500).json({ error: 'Lỗi khi lấy danh sách kế hoạch', message: error.message });
  }
};

/**
 * Kiểm tra điều kiện bắt đầu kế hoạch
 */
exports.checkStartConditions = async (req, res) => {
  try {
    const planId = req.params.id;
    const token = req.headers.authorization;
    const headers = { Authorization: token };

    // Lấy thông tin kế hoạch
    const planResponse = await axios.get(`${GATEWAY_URL}/plan/${planId}`, { headers });
    const plan = planResponse.data;

    const conditions = {
      planApproved: {
        status: false,
        message: "",
        details: {}
      },
      materialsReady: {
        status: false,
        message: "",
        details: {}
      },
      productionCapacityReady: {
        status: false,
        message: "",
        details: {}
      },
      managerConfirmation: {
        status: false,
        message: "",
        details: {}
      }
    };

    // (1) Kiểm tra kế hoạch đã được phê duyệt
    if (plan.trangThai === "Đã duyệt") {
      conditions.planApproved.status = true;
      conditions.planApproved.message = "Kế hoạch đã được Director phê duyệt";
      conditions.planApproved.details = {
        trangThai: plan.trangThai,
        nguoiDuyet: plan.nguoiDuyet || "Director",
        ngayDuyet: plan.ngayDuyet || plan.updatedAt
      };
    } else {
      conditions.planApproved.message = `Kế hoạch chưa được duyệt. Trạng thái hiện tại: ${plan.trangThai}`;
      conditions.planApproved.details = { trangThai: plan.trangThai };
    }

    // (2) Kiểm tra nguyên vật liệu đã sẵn sàng
    try {
      // Kiểm tra MaterialRequest - endpoint đúng là /warehouse/materials/requests
      // Thêm timeout để tránh chờ quá lâu
      const materialRequestResponse = await axios.get(
        `${GATEWAY_URL}/warehouse/materials/requests`,
        { 
          headers,
          timeout: 10000 // 10 giây timeout
        }
      );
      let materialRequests = Array.isArray(materialRequestResponse.data) 
        ? materialRequestResponse.data 
        : [];
      
      // Lọc theo keHoach
      materialRequests = materialRequests.filter(mr => 
        mr.keHoach === planId || mr.keHoach === plan._id
      );

      if (materialRequests.length === 0) {
        // Không có MaterialRequest = đủ NVL trong kho
        conditions.materialsReady.status = true;
        conditions.materialsReady.message = "Nguyên vật liệu đã sẵn sàng (không cần bổ sung)";
        conditions.materialsReady.details = {};
      } else {
        // Kiểm tra MaterialRequest đã duyệt và MaterialReceipt đã nhập kho
        const approvedRequest = materialRequests.find(
          mr => mr.trangThai === "Đã duyệt" || mr.trangThai === "Hoàn thành"
        );
        
        if (approvedRequest) {
          // Kiểm tra MaterialReceipt đã nhập kho - endpoint đúng là /warehouse/materials/receipts
          try {
            const receiptResponse = await axios.get(
              `${GATEWAY_URL}/warehouse/materials/receipts`,
              { 
                headers,
                timeout: 10000 // 10 giây timeout
              }
            );
            let receipts = Array.isArray(receiptResponse.data) 
              ? receiptResponse.data 
              : [];
            
            // Lọc theo keHoach
            receipts = receipts.filter(r => 
              r.keHoach === planId || r.keHoach === plan._id
            );
            
            const receivedReceipt = receipts.find(r => r.trangThai === "Da nhap");
            
            if (receivedReceipt) {
              conditions.materialsReady.status = true;
              conditions.materialsReady.message = "Nguyên vật liệu đã nhập kho và sẵn sàng";
              conditions.materialsReady.details = {
                materialRequest: approvedRequest.maPhieu,
                receipt: receivedReceipt.maPhieuNhap || receivedReceipt._id
              };
            } else {
              conditions.materialsReady.message = "Phiếu yêu cầu NVL đã duyệt nhưng chưa nhập kho";
              conditions.materialsReady.details = {
                materialRequest: approvedRequest.maPhieu,
                receiptStatus: "Chưa nhập kho"
              };
            }
          } catch (receiptErr) {
            // Nếu không thể kiểm tra receipt, vẫn hiển thị thông tin về material request
            console.error("❌ Error checking material receipts:", receiptErr.message);
            conditions.materialsReady.message = `Phiếu yêu cầu NVL (${approvedRequest.maPhieu}) đã duyệt, nhưng không thể kiểm tra trạng thái nhập kho`;
            conditions.materialsReady.details = {
              materialRequest: approvedRequest.maPhieu,
              error: receiptErr.response?.status === 503 
                ? "Dịch vụ kho không khả dụng" 
                : receiptErr.message
            };
          }
        } else {
          const pendingRequest = materialRequests.find(
            mr => mr.trangThai === "Chờ phê duyệt"
          );
          if (pendingRequest) {
            conditions.materialsReady.message = `Phiếu yêu cầu NVL (${pendingRequest.maPhieu}) đang chờ duyệt`;
            conditions.materialsReady.details = { materialRequest: pendingRequest.maPhieu };
          } else {
            conditions.materialsReady.message = "Chưa có phiếu yêu cầu NVL hoặc chưa được duyệt";
            conditions.materialsReady.details = { materialRequests };
          }
        }
      }
    } catch (err) {
      console.error("❌ Error checking materials:", err.message);
      const errorStatus = err.response?.status;
      const errorCode = err.code;
      
      let errorMessage = "Không thể kiểm tra trạng thái nguyên vật liệu";
      if (errorStatus === 503 || errorCode === "ECONNREFUSED") {
        errorMessage = "Dịch vụ kho không khả dụng. Vui lòng thử lại sau.";
      } else if (errorCode === "ECONNABORTED" || errorCode === "ETIMEDOUT") {
        errorMessage = "Yêu cầu kiểm tra trạng thái nguyên vật liệu đã hết thời gian chờ. Vui lòng thử lại.";
      } else if (err.message) {
        errorMessage = `Không thể kiểm tra trạng thái nguyên vật liệu: ${err.message}`;
      }
      
      conditions.materialsReady.message = errorMessage;
      conditions.materialsReady.details = { 
        error: err.message,
        status: errorStatus,
        code: errorCode
      };
    }

    // (3) Kiểm tra năng lực sản xuất sẵn sàng
    try {
      // Kiểm tra Work Assignment đã được tạo cho kế hoạch này chưa
      const assignmentsResponse = await axios.get(
        `${GATEWAY_URL}/factory/manager/assignments`,
        { headers }
      );
      const allAssignments = Array.isArray(assignmentsResponse.data) 
        ? assignmentsResponse.data 
        : [];
      
      // Lọc các assignment thuộc kế hoạch này
      const planAssignments = allAssignments.filter(a => {
        const assignmentPlanId = a.keHoach?.planId?.toString();
        const currentPlanId = planId?.toString() || plan._id?.toString();
        return assignmentPlanId === currentPlanId;
      });

      if (planAssignments.length === 0) {
        conditions.productionCapacityReady.message = "Chưa có tổ sản xuất được phân công cho kế hoạch này";
        conditions.productionCapacityReady.details = { 
          xuongPhuTrach: plan.xuongPhuTrach,
          note: "Cần tạo phân công công việc cho các tổ trước khi bắt đầu kế hoạch"
        };
      } else {
        // Lấy danh sách các tổ được phân công từ assignments
        const assignedTeamIds = new Set();
        planAssignments.forEach(a => {
          if (Array.isArray(a.congViec)) {
            a.congViec.forEach(cv => {
              if (cv.to?.id) {
                assignedTeamIds.add(cv.to.id.toString());
              }
            });
          }
        });

        if (assignedTeamIds.size === 0) {
          conditions.productionCapacityReady.message = "Phân công công việc chưa có tổ được chỉ định";
          conditions.productionCapacityReady.details = { 
            assignments: planAssignments.length 
          };
        } else {
          // Kiểm tra các tổ có đủ thành viên không
          const teamsResponse = await axios.get(`${GATEWAY_URL}/factory/to`, { headers });
          const teams = Array.isArray(teamsResponse.data) ? teamsResponse.data : [];
          
          const assignedTeams = teams.filter(t => 
            assignedTeamIds.has(t._id?.toString())
          );

          let totalMembers = 0;
          const teamDetails = [];
          
          assignedTeams.forEach(team => {
            const memberCount = Array.isArray(team.thanhVien) 
              ? team.thanhVien.length 
              : 0;
            totalMembers += memberCount;
            teamDetails.push({
              tenTo: team.tenTo,
              memberCount: memberCount
            });
          });

          if (totalMembers === 0) {
            conditions.productionCapacityReady.message = "Các tổ được phân công chưa có công nhân";
            conditions.productionCapacityReady.details = {
              teams: teamDetails,
              totalMembers: 0
            };
          } else {
            // Kiểm tra không trùng lịch với kế hoạch khác
            const startDate = new Date(plan.ngayBatDauDuKien);
            const endDate = new Date(plan.ngayKetThucDuKien);
            
            // Lấy tất cả các kế hoạch (không chỉ "Đang thực hiện") để kiểm tra conflict
            const otherPlansResponse = await axios.get(
              `${GATEWAY_URL}/plan`,
              { headers }
            );
            const otherPlans = Array.isArray(otherPlansResponse.data) 
              ? otherPlansResponse.data 
              : [];
            
            const conflictingPlans = otherPlans.filter(p => {
              // Bỏ qua kế hoạch hiện tại
              if (p._id === planId || p._id?.toString() === planId?.toString()) return false;
              // Bỏ qua các kế hoạch đã hoàn thành - không coi là conflict
              if (p.trangThai === "Hoàn thành") return false;
              // Chỉ kiểm tra chồng lấp với các kế hoạch cùng xưởng phụ trách
              if (p.xuongPhuTrach !== plan.xuongPhuTrach) return false;
              const pStart = new Date(p.ngayBatDauDuKien);
              const pEnd = new Date(p.ngayKetThucDuKien);
              return (
                (pStart >= startDate && pStart <= endDate) ||
                (pEnd >= startDate && pEnd <= endDate) ||
                (pStart <= startDate && pEnd >= endDate)
              );
            });

            if (conflictingPlans.length === 0) {
              conditions.productionCapacityReady.status = true;
              conditions.productionCapacityReady.message = "Năng lực sản xuất sẵn sàng";
              conditions.productionCapacityReady.details = {
                assignments: planAssignments.length,
                teams: teamDetails,
                totalMembers: totalMembers,
                noConflicts: true
              };
            } else {
              conditions.productionCapacityReady.message = `Có ${conflictingPlans.length} kế hoạch khác đang thực hiện trong khoảng thời gian này`;
              conditions.productionCapacityReady.details = {
                teams: teamDetails,
                totalMembers: totalMembers,
                conflictingPlans: conflictingPlans.map(p => p.maKeHoach || p._id)
              };
            }
          }
        }
      }
    } catch (err) {
      console.error("❌ Error checking production capacity:", err.message);
      conditions.productionCapacityReady.message = "Không thể kiểm tra năng lực sản xuất";
      conditions.productionCapacityReady.details = { error: err.message };
    }

    // (4) Xưởng trưởng xác nhận (lịch xưởng trống)
    // Kiểm tra WorkAssignment và ShiftSchedule trong khoảng thời gian kế hoạch
    try {
      const startDate = new Date(plan.ngayBatDauDuKien);
      const endDate = new Date(plan.ngayKetThucDuKien);
      
      // Kiểm tra WorkAssignment - dùng route manager
      const assignmentsResponse = await axios.get(
        `${GATEWAY_URL}/factory/manager/assignments`,
        { headers }
      );
      const assignments = Array.isArray(assignmentsResponse.data) 
        ? assignmentsResponse.data 
        : [];
      
      const conflictingAssignments = assignments.filter(a => {
        if (!a.ngay) return false;
        const aDate = new Date(a.ngay);
        return aDate >= startDate && aDate <= endDate && 
               a.trangThai === "Dang thuc hien";
      });

      // Kiểm tra ShiftSchedule
      // Lưu ý: Route này yêu cầu role xuongtruong/totruong, nên có thể bị 404
      // Nếu lỗi, coi như không có ca làm trùng (lịch trống)
      let shifts = [];
      try {
        const shiftsResponse = await axios.get(
          `${GATEWAY_URL}/factory/teamleader/shifts`,
          { headers, params: {} }
        );
        shifts = Array.isArray(shiftsResponse.data) 
          ? shiftsResponse.data 
          : [];
      } catch (shiftErr) {
        // Nếu lỗi 404 hoặc 403, coi như không có ca làm (lịch trống)
        if (shiftErr.response?.status === 404 || shiftErr.response?.status === 403) {
          console.log("⚠️ Không thể truy cập lịch phân ca (có thể do quyền), coi như lịch trống");
          shifts = [];
        } else {
          throw shiftErr; // Ném lại lỗi khác
        }
      }
      
      const conflictingShifts = shifts.filter(s => {
        if (!s.ngay) return false;
        const sDate = new Date(s.ngay);
        return sDate >= startDate && sDate <= endDate;
      });

      if (conflictingAssignments.length === 0 && conflictingShifts.length === 0) {
        conditions.managerConfirmation.status = true;
        conditions.managerConfirmation.message = "Lịch xưởng trống, có thể triển khai";
        conditions.managerConfirmation.details = {};
      } else {
        conditions.managerConfirmation.message = `Lịch xưởng có ${conflictingAssignments.length} phân công và ${conflictingShifts.length} ca làm trong khoảng thời gian này`;
        conditions.managerConfirmation.details = {};
      }
    } catch (err) {
      console.error("❌ Error checking schedule:", err.message);
      conditions.managerConfirmation.message = "Không thể kiểm tra lịch xưởng";
      conditions.managerConfirmation.details = { error: err.message };
    }

    res.status(200).json({
      planId: planId,
      planCode: plan.maKeHoach,
      conditions: conditions,
      allConditionsMet: Object.values(conditions).every(c => c.status === true)
    });
  } catch (error) {
    console.error("❌ Error checking start conditions:", error.message);
    if (error.response) {
      return res.status(error.response.status).json({
        error: error.response.data?.message || error.response.data?.error || "Lỗi khi kiểm tra điều kiện"
      });
    }
    res.status(500).json({ error: "Lỗi khi kiểm tra điều kiện", message: error.message });
  }
};

/**
 * Bắt đầu kế hoạch (chuyển trạng thái sang Đang thực hiện)
 */
exports.startPlan = async (req, res) => {
  try {
    const planId = req.params.id;
    const token = req.headers.authorization;
    const headers = { Authorization: token };

    // Kiểm tra điều kiện trước
    const checkResponse = await axios.get(
      `${GATEWAY_URL}/factory/manager/plans/${planId}/check-start-conditions`,
      { headers }
    );
    const checkResult = checkResponse.data;

    if (!checkResult.allConditionsMet) {
      return res.status(400).json({
        error: "Không thể bắt đầu kế hoạch",
        message: "Chưa đủ điều kiện để bắt đầu kế hoạch. Vui lòng kiểm tra lại các điều kiện.",
        conditions: checkResult.conditions
      });
    }

    // Lấy thông tin kế hoạch trước khi cập nhật
    const planResponse = await axios.get(`${GATEWAY_URL}/plan/${planId}`, { headers });
    const plan = planResponse.data;

    // Cập nhật trạng thái kế hoạch
    const updateResponse = await axios.put(
      `${GATEWAY_URL}/plan/${planId}`,
      { trangThai: "Đang thực hiện" },
      { headers }
    );

    const updatedPlan = updateResponse.data.plan || updateResponse.data;

    // Tự động tạo lô sản xuất khi bắt đầu kế hoạch
    try {
      const user = req.user || {};
      const lot = await createLotForPlan(updatedPlan || plan, user);
      console.log(`✅ Đã tạo lô sản xuất ${lot.maLo} cho kế hoạch ${planId}`);
    } catch (lotError) {
      console.error("❌ Lỗi khi tạo lô sản xuất:", lotError.message);
      // Không block response nếu lỗi tạo lô, nhưng log để debug
    }

    res.status(200).json({
      message: "Đã bắt đầu kế hoạch thành công",
      plan: updatedPlan
    });
  } catch (error) {
    console.error("❌ Error starting plan:", error.message);
    if (error.response) {
      return res.status(error.response.status).json({
        error: error.response.data?.message || error.response.data?.error || "Lỗi khi bắt đầu kế hoạch"
      });
    }
    res.status(500).json({ error: "Lỗi khi bắt đầu kế hoạch", message: error.message });
  }
};


