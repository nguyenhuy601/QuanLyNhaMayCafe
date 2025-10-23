const amqp = require("amqplib");

/** Gửi event sang production-plan-service */
exports.publishEvent = async (event, payload) => {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();
  await channel.assertExchange("director_events", "fanout", { durable: false });
  channel.publish("director_events", "", Buffer.from(JSON.stringify({ event, payload })));
  await channel.close();
  await connection.close();
};
