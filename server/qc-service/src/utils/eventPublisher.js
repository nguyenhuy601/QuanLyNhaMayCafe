const amqp = require("amqplib");

exports.publishEvent = async (event, payload) => {
  const connection = await amqp.connect("amqp://admin:admin@rabbitmq:5672");
  const channel = await connection.createChannel();
  await channel.assertExchange("qc_events", "fanout", { durable: false });
  channel.publish("qc_events", "", Buffer.from(JSON.stringify({ event, payload })));
  await channel.close();
  await connection.close();
};
