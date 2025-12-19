const amqp = require("amqplib");

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

        // Đã xóa logic tự động tạo WorkAssignment khi duyệt kế hoạch
        // Xưởng trưởng sẽ tự tạo phân công công việc thủ công khi cần
        if (event === "PLAN_READY" || event === "PLAN_APPROVED") {
          console.log("📋 [factory-service] Plan approved/ready:", payload._id || payload.id, "- Không tự động tạo WorkAssignment");
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
