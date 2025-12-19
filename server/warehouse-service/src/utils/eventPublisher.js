const amqp = require("amqplib");

const RABBITMQ_URL = process.env.RABBITMQ_URL || process.env.AMQP_URL || "amqp://rabbitmq:5672";
const DISABLE_RABBITMQ = process.env.DISABLE_RABBITMQ === 'true';

exports.publishEvent = async (event, payload) => {
  if (DISABLE_RABBITMQ) {
    console.log(`ℹ️ [publishEvent] RabbitMQ is disabled. Event ${event} not published.`);
    return;
  }

  let connection = null;
  let channel = null;
  
  try {
    // Thử kết nối với timeout ngắn hơn và xử lý lỗi authentication
    connection = await amqp.connect(RABBITMQ_URL, {
      heartbeat: 60, // seconds
      timeout: 5000, // milliseconds - giảm timeout
    });
    channel = await connection.createChannel();
    await channel.assertExchange("warehouse_events", "fanout", { durable: false });
    channel.publish("warehouse_events", "", Buffer.from(JSON.stringify({ event, payload })));
    console.log(`✅ [publishEvent] Đã publish event ${event} lên RabbitMQ`);
  } catch (err) {
    // Xử lý các loại lỗi khác nhau
    if (err.message && err.message.includes("ACCESS_REFUSED")) {
      console.warn(`⚠️ [publishEvent] RabbitMQ authentication failed. Event ${event} not published.`);
      console.warn(`   Có thể RabbitMQ yêu cầu username/password. Kiểm tra RABBITMQ_URL hoặc set DISABLE_RABBITMQ=true để tắt.`);
    } else if (err.message && err.message.includes("ECONNREFUSED")) {
      console.warn(`⚠️ [publishEvent] Không thể kết nối đến RabbitMQ. Event ${event} not published.`);
      console.warn(`   RabbitMQ có thể chưa chạy hoặc URL không đúng: ${RABBITMQ_URL}`);
    } else {
      console.warn(`⚠️ [publishEvent] Lỗi kết nối hoặc publish RabbitMQ:`, err.message);
      console.warn(`   RabbitMQ URL: ${RABBITMQ_URL}`);
    }
    // Do not throw to prevent crashing the application, just log the warning.
  } finally {
    try {
      if (channel) await channel.close();
      if (connection) await connection.close();
    } catch (closeErr) {
      // Ignore close errors
    }
  }
};
