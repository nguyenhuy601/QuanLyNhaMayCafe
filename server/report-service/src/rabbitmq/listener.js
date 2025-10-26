const amqp = require("amqplib");
const { aggregateEventData } = require("../utils/dataAggregator");

exports.listenEvents = async () => {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  // Gom tất cả event vào 1 exchange tổng
  const exchanges = ["sales_events", "factory_events", "qc_events", "warehouse_events", "hr_events"];
  for (const ex of exchanges) {
    await channel.assertExchange(ex, "fanout", { durable: false });
    const { queue } = await channel.assertQueue("", { exclusive: true });
    channel.bindQueue(queue, ex, "");

    channel.consume(queue, async (msg) => {
      if (!msg.content) return;
      const { event, payload } = JSON.parse(msg.content.toString());
      console.log(`📩 [report-service] Received: ${event}`);
      await aggregateEventData(event, payload);
    });
  }
};
