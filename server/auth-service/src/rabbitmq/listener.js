const amqp = require("amqplib");
const Account = require("../models/Account");
const bcrypt = require("bcrypt");

exports.listenUserEvents = async () => {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();
  await channel.assertExchange("user_events", "fanout", { durable: false });

  const { queue } = await channel.assertQueue("", { exclusive: true });
  channel.bindQueue(queue, "user_events", "");

  channel.consume(queue, async (msg) => {
    if (msg.content) {
      const { event, payload } = JSON.parse(msg.content.toString());
      console.log("📩 [auth-service] Event received:", event);

      if (event === "USER_CREATED") {
        const hashed = await bcrypt.hash("123456", 10);
        await Account.create({
          userId: payload._id,
          email: payload.email,
          password: hashed,
          role: payload.role,
        });
        console.log("✅ Account created for:", payload.email);
      }
    }
  });
};
