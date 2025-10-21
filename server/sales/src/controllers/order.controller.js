const Order = require("../models/Order");

/** Lấy danh sách đơn hàng */
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("khachHang nguoiTao danhSachSanPham.sanPham")
      .sort({ ngayDat: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Tạo đơn hàng mới */
exports.createOrder = async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json({ message: "Tạo đơn hàng thành công", order });

    // 🚀 TODO: gửi event ORDER_CREATED đến production-service để tạo kế hoạch
    // Ví dụ: RabbitMQ.publish("ORDER_CREATED", order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Cập nhật trạng thái đơn hàng (đã duyệt / hủy / hoàn tất) */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Order.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    res.status(200).json({ message: "Cập nhật đơn hàng thành công", order: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
