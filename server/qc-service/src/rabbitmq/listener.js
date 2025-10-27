const amqp = require("amqplib");
const QCRequest = require("../models/QCRequest");

exports.listenFactoryEvents = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URI);
  const channel = await connection.createChannel();
  await channel.assertExchange("factory_events", "fanout", { durable: false });

  const { queue } = await channel.assertQueue("", { exclusive: true });
  channel.bindQueue(queue, "factory_events", "");

  channel.consume(queue, async (msg) => {
    if (!msg.content) return;
    const { event, payload } = JSON.parse(msg.content.toString());
    console.log("📩 [qc-service] Received:", event);

    if (event === "PRODUCTION_DONE") {
      await QCRequest.create({
        ngayYeuCau: new Date(),
        noiDung: `Kiểm tra lô hàng ${payload._id} từ xưởng`,
        trangThai: "Chờ kiểm tra",
        nguoiYeuCau: payload.nguoiLap || null,
        logSanXuat: payload._id,
      });
      console.log("🧾 QCRequest created for production log:", payload._id);
    }
  });
};
