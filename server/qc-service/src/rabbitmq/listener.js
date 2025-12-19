const amqp = require("amqplib");
const QCRequest = require("../models/QCRequest");

const RABBITMQ_URI = process.env.RABBITMQ_URI || 
                     process.env.RABBITMQ_URL || 
                     "amqp://rabbitmq:5672";

exports.listenFactoryEvents = async () => {
  // Kiểm tra xem RabbitMQ có được bật không
  if (process.env.DISABLE_RABBITMQ === "true") {
    console.log("ℹ️ [qc-service] RabbitMQ đã bị tắt, bỏ qua listener");
    return;
  }

  try {
    console.log(`🔌 [qc-service] Đang kết nối RabbitMQ: ${RABBITMQ_URI.replace(/:[^:@]+@/, ":****@")}`);
    const connection = await amqp.connect(RABBITMQ_URI, {
      heartbeat: 60,
      connectionTimeout: 5000,
    });
    console.log("✅ [qc-service] Đã kết nối RabbitMQ");
    
    const channel = await connection.createChannel();
    await channel.assertExchange("factory_events", "fanout", { durable: false });

    const { queue } = await channel.assertQueue("", { exclusive: true });
    channel.bindQueue(queue, "factory_events", "");

    channel.consume(queue, async (msg) => {
      if (!msg?.content) {
        channel.ack(msg);
        return;
      }
      
      try {
        const { event, payload } = JSON.parse(msg.content.toString());
        console.log("📩 [qc-service] Received:", event);

        if (event === "PRODUCTION_DONE") {
          await QCRequest.create({
            ngayYeuCau: new Date(),
            noiDung: `Kiểm tra lô hàng ${payload._id} từ xưởng`,
            trangThai: "Chờ kiểm tra",
            nguoiYeuCau: payload.nguoiLap || null,
            logSanXuat: payload._id,
          });
          console.log("🧾 QCRequest created for production log:", payload._id);
        }
        
        channel.ack(msg);
      } catch (err) {
        console.error("❌ [qc-service] Lỗi xử lý message:", err.message);
        channel.nack(msg, false, false); // Không requeue
      }
    }, { noAck: false });

    connection.on("close", () => {
      console.warn("⚠️ [qc-service] RabbitMQ connection closed. Reconnecting in 5s...");
      setTimeout(exports.listenFactoryEvents, 5000);
    });

    connection.on("error", (err) => {
      console.error("❌ [qc-service] RabbitMQ connection error:", err.message);
    });

    console.log("✅ [qc-service] RabbitMQ listener started");
  } catch (error) {
    console.error("❌ [qc-service] Failed to connect to RabbitMQ:", error.message);
    console.log("🔄 [qc-service] Retrying connection in 5 seconds...");
    setTimeout(exports.listenFactoryEvents, 5000);
  }
};
