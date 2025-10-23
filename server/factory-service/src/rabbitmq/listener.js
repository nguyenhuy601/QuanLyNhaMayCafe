const amqp = require("amqplib");
const WorkAssignment = require("../models/WorkAssignment");

exports.listenPlanEvents = async () => {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();
  await channel.assertExchange("plan_events", "fanout", { durable: false });

  const { queue } = await channel.assertQueue("", { exclusive: true });
  channel.bindQueue(queue, "plan_events", "");

  channel.consume(queue, async (msg) => {
    if (!msg.content) return;
    const { event, payload } = JSON.parse(msg.content.toString());
    console.log("📩 [factory-service] Received:", event);

    if (event === "PLAN_READY") {
      // Khi kế hoạch sẵn sàng → tạo phân công mặc định
      await WorkAssignment.create({
        keHoach: payload._id,
        ngayPhanCong: new Date(),
        trangThai: "Chờ xưởng trưởng duyệt",
      });
      console.log("🧾 WorkAssignment created for plan:", payload._id);
    }
  });
};
