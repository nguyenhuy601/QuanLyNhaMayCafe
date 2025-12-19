const amqp = require("amqplib");

// Sử dụng RABBITMQ_URI (giống các service khác) hoặc fallback
const RABBITMQ_URL = process.env.RABBITMQ_URI || 
                     process.env.RABBITMQ_URL || 
                     process.env.AMQP_URL || 
                     "amqp://rabbitmq:5672"; // Dùng service name trong Docker

exports.publishEvent = async (event, payload) => {
  // Kiểm tra xem RabbitMQ có được bật không (qua biến môi trường)
  if (process.env.DISABLE_RABBITMQ === "true") {
    console.log(`ℹ️ [publishEvent] RabbitMQ đã bị tắt, bỏ qua event ${event}`);
    return;
  }

  let connection = null;
  let channel = null;
  
  try {
    connection = await amqp.connect(RABBITMQ_URL, {
      heartbeat: 60, // Heartbeat để giữ connection alive
      connectionTimeout: 5000, // Timeout 5 giây
    });
    channel = await connection.createChannel();
    await channel.assertExchange("qc_events", "fanout", { durable: false });
    channel.publish("qc_events", "", Buffer.from(JSON.stringify({ event, payload })));
    console.log(`✅ [publishEvent] Đã publish event ${event} lên RabbitMQ`);
  } catch (err) {
    // Chỉ log warning, không throw để không block response
    console.warn(`⚠️ [publishEvent] Không thể publish event ${event} lên RabbitMQ:`, err.message);
    console.warn(`   RabbitMQ URL: ${RABBITMQ_URL.replace(/:[^:@]+@/, ":****@")}`);
    console.warn(`   Lưu ý: Event này sẽ không được gửi đến các service khác`);
    // KHÔNG throw để không block response
    return;
  } finally {
    // Đảm bảo đóng connection và channel
    try {
      if (channel) {
        await channel.close();
      }
      if (connection) {
        await connection.close();
      }
    } catch (closeErr) {
      // Log nhưng không throw
      console.warn(`⚠️ [publishEvent] Lỗi đóng RabbitMQ connection:`, closeErr.message);
    }
  }
};
