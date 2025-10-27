const amqp = require("amqplib");
const FinishedReceipt = require("../models/FinishedReceipt");
const MaterialRequest = require("../models/MaterialRequest");
const { publishEvent } = require("../utils/eventPublisher");

exports.listenEvents = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URI);
  const channel = await connection.createChannel();

  // Lắng nghe event từ QC-Service
  await channel.assertExchange("qc_events", "fanout", { durable: false });
  const qcQueue = await channel.assertQueue("", { exclusive: true });
  channel.bindQueue(qcQueue.queue, "qc_events", "");

  channel.consume(qcQueue.queue, async (msg) => {
    if (!msg.content) return;
    const { event, payload } = JSON.parse(msg.content.toString());
    console.log("📩 [warehouse-service] Received:", event);

    if (event === "QC_PASSED") {
      await FinishedReceipt.create({
        ngayNhap: new Date(),
        noiDung: `Nhập thành phẩm đạt QC`,
        trangThai: "Đã nhập kho",
        logQC: payload._id,
      });
      console.log("📦 Thành phẩm nhập kho:", payload._id);
    }
  });

  // Lắng nghe event từ production-plan-service (thiếu NVL)
  await channel.assertExchange("plan_events", "fanout", { durable: false });
  const planQueue = await channel.assertQueue("", { exclusive: true });
  channel.bindQueue(planQueue.queue, "plan_events", "");

  channel.consume(planQueue.queue, async (msg) => {
    if (!msg.content) return;
    const { event, payload } = JSON.parse(msg.content.toString());
    if (event === "MATERIAL_REQUEST") {
      await MaterialRequest.create({
        ngayYeuCau: new Date(),
        noiDung: `Yêu cầu bổ sung NVL cho kế hoạch ${payload._id}`,
        trangThai: "Chờ xử lý",
      });
      console.log("🧾 Material Request created:", payload._id);
    }
  });
};
