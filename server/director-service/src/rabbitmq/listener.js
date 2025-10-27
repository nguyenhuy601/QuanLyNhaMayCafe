const amqp = require("amqplib");
const Order = require("../models/Order");
const { publishEvent } = require("../utils/eventPublisher");

/** Lắng nghe sự kiện ORDER_CREATED */
exports.listenOrderEvents = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URI);
  const channel = await connection.createChannel();
  await channel.assertExchange("order_events", "fanout", { durable: false });

  const { queue } = await channel.assertQueue("", { exclusive: true });
  channel.bindQueue(queue, "order_events", "");

  channel.consume(queue, async (msg) => {
    if (!msg.content) return;
    const { event, payload } = JSON.parse(msg.content.toString());
    console.log("📩 [director-service] Received:", event);

    if (event === "ORDER_CREATED") {
      // Lưu vào DB để chờ duyệt
      await Order.create(payload);
      console.log("🗃️ Đã lưu đơn hàng chờ duyệt");
    }
  });
};
