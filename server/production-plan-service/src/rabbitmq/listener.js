const amqp = require("amqplib");
const { createPlanFromEvent } = require("../controllers/plan.controller");

exports.listenDirectorEvents = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URI || process.env.RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertExchange("director_events", "fanout", { durable: false });

  const { queue } = await channel.assertQueue("", { exclusive: true });
  channel.bindQueue(queue, "director_events", "");

  channel.consume(queue, async (msg) => {
    if (!msg.content) {
      channel.ack(msg);
      return;
    }
    
    try {
      const { event, payload } = JSON.parse(msg.content.toString());
      console.log("📩 [production-plan-service] Received:", event);

      if (event === "ORDER_APPROVED") {
        await createPlanFromEvent(payload);
      }
      
      // Acknowledge message sau khi xử lý thành công
      channel.ack(msg);
    } catch (err) {
      console.error("❌ [production-plan-service] Error processing message:", err.message);
      // Reject message và không requeue nếu lỗi nghiêm trọng
      channel.nack(msg, false, false);
    }
  }, { noAck: false });
};
