const axios = require('axios');
const { publishEvent } = require("../utils/eventPublisher");

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://api-gateway:4000';

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


