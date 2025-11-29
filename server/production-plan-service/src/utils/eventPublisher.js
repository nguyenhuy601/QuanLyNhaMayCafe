const amqp = require("amqplib");

/**
 * Publish an event to RabbitMQ. Uses RABBITMQ_URL env var when available.
 * If RabbitMQ is unavailable, logs the error but does not throw to avoid
 * crashing the calling flow (plans can still be created offline).
 */
exports.publishEvent = async (event, payload) => {
  const RABBITMQ_URL = process.env.RABBITMQ_URL || process.env.RABBITMQ_URI;

  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertExchange("plan_events", "fanout", { durable: false });
    channel.publish("plan_events", "", Buffer.from(JSON.stringify({ event, payload })));
    await channel.close();
    await connection.close();
  } catch (err) {
    // Log but don't rethrow — allow the service to continue working without RabbitMQ
    console.error("⚠️ Failed to publish event to RabbitMQ:", err.message || err);
  }
};
