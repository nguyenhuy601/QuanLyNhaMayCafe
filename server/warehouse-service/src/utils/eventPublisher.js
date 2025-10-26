const amqp = require("amqplib");

exports.publishEvent = async (event, payload) => {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();
  await channel.assertExchange("warehouse_events", "fanout", { durable: false });
  channel.publish("warehouse_events", "", Buffer.from(JSON.stringify({ event, payload })));
  await channel.close();
  await connection.close();
};
