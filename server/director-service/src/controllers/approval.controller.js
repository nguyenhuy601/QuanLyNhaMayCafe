const Order = require("../models/Order");
const { publishEvent } = require("../utils/eventPublisher");

/** Lấy danh sách đơn chờ duyệt */
exports.getPendingOrders = async (req, res) => {
  try {
    const list = await Order.find({ trangThai: "Chờ duyệt" });
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Duyệt đơn hàng */
exports.approveOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { trangThai: "Đã duyệt" }, { new: true });
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    // Gửi event sang production-plan-service
    await publishEvent("ORDER_APPROVED", order);
    res.status(200).json({ message: "Đã duyệt đơn hàng", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Từ chối đơn hàng */
exports.rejectOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { trangThai: "Từ chối" }, { new: true });
    res.status(200).json({ message: "Đơn hàng bị từ chối", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
