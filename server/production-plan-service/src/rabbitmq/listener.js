const amqp = require("amqplib");
const { createProductionPlan } = require("../controllers/plan.controller");

exports.listenDirectorEvents = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URI);
  const channel = await connection.createChannel();
  await channel.assertExchange("director_events", "fanout", { durable: false });

  const { queue } = await channel.assertQueue("", { exclusive: true });
  channel.bindQueue(queue, "director_events", "");

  channel.consume(queue, async (msg) => {
    if (!msg.content) return;
    const { event, payload } = JSON.parse(msg.content.toString());
    console.log("📩 [production-plan-service] Received:", event);

    if (event === "ORDER_APPROVED") {
      await createProductionPlan(payload); // Gọi controller để tạo kế hoạch
    }
  });
};
