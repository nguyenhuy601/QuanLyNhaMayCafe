const amqp = require("amqplib");
const WorkAssignment = require("../models/WorkAssignment");

const RABBITMQ_URI = process.env.RABBITMQ_URI || process.env.RABBITMQ_URL || "amqp://rabbitmq:5672";

exports.listenPlanEvents = async () => {
  try {
    const connection = await amqp.connect(RABBITMQ_URI);
    const channel = await connection.createChannel();
    await channel.assertExchange("plan_events", "fanout", { durable: false });

    const { queue } = await channel.assertQueue("", { exclusive: true });
    channel.bindQueue(queue, "plan_events", "");

    console.log("✅ [factory-service] Connected to RabbitMQ and listening for plan events");

    channel.consume(queue, async (msg) => {
      if (!msg?.content) return;
      try {
        const { event, payload } = JSON.parse(msg.content.toString());
        console.log(`📩 [factory-service] Received event: ${event}`);

        if (event === "PLAN_READY" || event === "PLAN_APPROVED") {
          const assignmentPayload = {
            keHoach: {
              planId: payload._id || payload.id,
              maKeHoach: payload.maKeHoach || payload.maKH,
              soLuongCanSanXuat: payload.soLuongCanSanXuat || payload.soLuong,
              soLuongNVLUocTinh: payload.soLuongNVLUocTinh || 0,
              ngayBatDauDuKien: payload.ngayBatDauDuKien || payload.ngayBatDau,
              ngayKetThucDuKien: payload.ngayKetThucDuKien || payload.ngayKetThuc,
              sanPham: payload.sanPham || {},
            },
            xuong: {
              id: payload.xuongPhuTrach || payload.xuong?.id,
              tenXuong: payload.xuongPhuTrach || payload.xuong?.tenXuong || "Chưa xác định",
            },
            ngay: new Date(),
            trangThai: "Cho xac nhan",
            ghiChu: `Tự động tạo từ kế hoạch ${payload.maKeHoach || payload.maKH || payload._id || payload.id}`,
          };

          await WorkAssignment.create(assignmentPayload);
          console.log("🧾 [factory-service] WorkAssignment created for plan:", payload._id || payload.id);
        }
      } catch (err) {
        console.error("❌ [factory-service] Error processing plan event:", err.message);
      }
    }, { noAck: true });

    connection.on("close", () => {
      console.warn("⚠️ [factory-service] RabbitMQ connection closed. Reconnecting...");
      setTimeout(exports.listenPlanEvents, 5000);
    });

    connection.on("error", (err) => {
      console.error("❌ [factory-service] RabbitMQ connection error:", err.message);
    });
  } catch (error) {
    console.error("❌ [factory-service] Failed to connect to RabbitMQ:", error.message);
    console.log("🔄 [factory-service] Retrying connection in 5 seconds...");
    setTimeout(exports.listenPlanEvents, 5000);
  }
};
