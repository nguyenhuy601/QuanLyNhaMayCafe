const Order = require("../models/Order");
const amqp = require("amqplib");

/** Gửi event sang RabbitMQ */
async function publishEvent(event, payload) {
  const connection = await amqp.connect(process.env.RABBITMQ_URI);
  const channel = await connection.createChannel();
  await channel.assertExchange("order_events", "fanout", { durable: false });
  channel.publish("order_events", "", Buffer.from(JSON.stringify({ event, payload })));
  await channel.close();
  await connection.close();
}

/** Lấy tất cả đơn hàng */
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

    // Gửi event sang director-service để duyệt
    await publishEvent("ORDER_CREATED", order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Cập nhật đơn hàng (sửa thông tin hoặc trạng thái) */
exports.updateOrder = async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "Cập nhật đơn hàng thành công", order: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
