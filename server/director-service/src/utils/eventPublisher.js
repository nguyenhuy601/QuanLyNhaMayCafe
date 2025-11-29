const amqp = require("amqplib");

const DIRECTOR_EXCHANGE = process.env.DIRECTOR_EXCHANGE || "director_events";
const RABBIT_URI = process.env.RABBITMQ_URI || process.env.RABBITMQ_URL || "amqp://rabbitmq:5672";

exports.publishEvent = async (event, payload) => {
  try {
    const connection = await amqp.connect(RABBIT_URI);
    const channel = await connection.createChannel();
    await channel.assertExchange(DIRECTOR_EXCHANGE, "fanout", { durable: false });
    channel.publish(DIRECTOR_EXCHANGE, "", Buffer.from(JSON.stringify({ event, payload })));
    await channel.close();
    await connection.close();
  } catch (error) {
    console.error(`❌ Không thể publish event ${event}:`, error.message);
  }
};
