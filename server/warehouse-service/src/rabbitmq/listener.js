const amqp = require("amqplib");
const FinishedReceipt = require("../models/FinishedReceipt");
const MaterialRequest = require("../models/MaterialRequest");
const { publishEvent } = require("../utils/eventPublisher");

exports.listenEvents = async () => {
  try {
    const RABBITMQ_URI = process.env.RABBITMQ_URI || process.env.RABBITMQ_URL || "amqp://rabbitmq:5672";
    console.log("🔌 [warehouse-service] Connecting to RabbitMQ:", RABBITMQ_URI.replace(/:[^:@]+@/, ":****@"));
    
    const connection = await amqp.connect(RABBITMQ_URI);
    console.log("✅ [warehouse-service] Connected to RabbitMQ");
    
    const channel = await connection.createChannel();
    console.log("✅ [warehouse-service] RabbitMQ channel created");

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

  // Lắng nghe event từ production-plan-service và director-service
  await channel.assertExchange("plan_events", "fanout", { durable: false });
  await channel.assertExchange("director_events", "fanout", { durable: false });
  console.log("✅ [warehouse-service] Exchanges asserted: plan_events, director_events");
  
  const planQueue = await channel.assertQueue("", { exclusive: true });
  channel.bindQueue(planQueue.queue, "plan_events", "");
  channel.bindQueue(planQueue.queue, "director_events", "");
  console.log(`✅ [warehouse-service] Queue created and bound: ${planQueue.queue}`);
  console.log("📡 [warehouse-service] Listening for events: MATERIAL_REQUEST, PLAN_APPROVED");

  channel.consume(planQueue.queue, async (msg) => {
    if (!msg.content) return;
    const { event, payload } = JSON.parse(msg.content.toString());
    console.log("📩 [warehouse-service] Received event:", event);
    
    if (event === "MATERIAL_REQUEST") {
      // Event trực tiếp từ production-plan-service
      await MaterialRequest.create({
        keHoach: payload._id || payload.keHoach,
        ngayYeuCau: new Date(),
        danhSachNVL: payload.danhSachNVL || payload.nvlCanThiet || [],
        trangThai: "Chờ phê duyệt",
        nguoiTao: payload.nguoiTao || payload.nguoiLap,
      });
      console.log("🧾 Material Request created from MATERIAL_REQUEST event:", payload._id || payload.keHoach);
    } else if (event === "PLAN_APPROVED") {
      // Khi kế hoạch được duyệt, kiểm tra tồn kho và tạo MaterialRequest nếu thiếu NVL
      try {
        console.log("📋 [warehouse-service] Processing PLAN_APPROVED event");
        console.log("📋 [warehouse-service] Plan payload:", JSON.stringify(payload, null, 2));
        
        const plan = payload;
        const nvlCanThiet = plan.nvlCanThiet || [];
        
        console.log(`📋 [warehouse-service] Plan ${plan._id || plan.id} has ${nvlCanThiet.length} required materials`);
        
        if (!nvlCanThiet || nvlCanThiet.length === 0) {
          console.log("ℹ️ [warehouse-service] Plan has no required materials, skipping MaterialRequest");
          return;
        }
        
        // Kiểm tra tồn kho cho từng NVL
        const axios = require("axios");
        const GATEWAY_URL = process.env.GATEWAY_URL || "http://api-gateway:4000";
        const missingMaterials = [];
        let checkedCount = 0;
        
        for (const nvl of nvlCanThiet) {
          const productId = nvl.productId || nvl._id || nvl.nvl;
          if (!productId) {
            console.warn(`⚠️ [warehouse-service] Skipping NVL item without productId:`, nvl);
            continue;
          }
          
          checkedCount++;
          try {
            console.log(`🔍 [warehouse-service] Checking stock for product ${productId}...`);
            const productResponse = await axios.get(`${GATEWAY_URL}/products/${productId}`);
            const product = productResponse.data;
            const currentStock = product.soLuong || 0;
            const requiredQuantity = nvl.soLuong || 0;
            
            console.log(`📊 [warehouse-service] Product ${productId}: current=${currentStock}, required=${requiredQuantity}`);
            
            if (currentStock < requiredQuantity) {
              const missingQty = requiredQuantity - currentStock;
              missingMaterials.push({
                nvl: productId,
                soLuong: missingQty,
                lyDo: `Thiếu ${missingQty} ${product.donViTinh || ""} (hiện có: ${currentStock}, cần: ${requiredQuantity})`,
              });
              console.log(`⚠️ [warehouse-service] Product ${productId} is missing ${missingQty} units`);
            } else {
              console.log(`✅ [warehouse-service] Product ${productId} has sufficient stock`);
            }
          } catch (err) {
            console.error(`❌ Error checking stock for product ${productId}:`, err.message);
            // Nếu không kiểm tra được, coi như thiếu và tạo MaterialRequest với toàn bộ số lượng cần
            missingMaterials.push({
              nvl: productId,
              soLuong: nvl.soLuong || 0,
              lyDo: `Không thể kiểm tra tồn kho: ${err.message}`,
            });
            console.warn(`⚠️ [warehouse-service] Cannot check stock for ${productId}, assuming missing`);
          }
        }
        
        console.log(`📊 [warehouse-service] Checked ${checkedCount} materials, found ${missingMaterials.length} missing`);
        
        // Nếu có NVL thiếu, tạo MaterialRequest
        if (missingMaterials.length > 0) {
          const materialRequest = await MaterialRequest.create({
            keHoach: plan._id || plan.id,
            ngayYeuCau: new Date(),
            danhSachNVL: missingMaterials,
            trangThai: "Chờ phê duyệt",
            nguoiTao: plan.nguoiLap || "system",
          });
          console.log(`✅ [warehouse-service] Material Request created: ${materialRequest._id} for plan ${plan._id || plan.id}`);
          console.log(`📋 [warehouse-service] Material Request details:`, JSON.stringify({
            maPhieu: materialRequest.maPhieu,
            keHoach: materialRequest.keHoach,
            danhSachNVL: materialRequest.danhSachNVL,
            trangThai: materialRequest.trangThai,
          }, null, 2));
        } else {
          console.log(`✅ Plan ${plan._id || plan.id} has sufficient materials, no MaterialRequest needed`);
        }
      } catch (err) {
        console.error("❌ Error processing PLAN_APPROVED event:", err.message);
        console.error("❌ Error stack:", err.stack);
      }
    }
  }, { noAck: true });
  
  // Xử lý lỗi kết nối
  connection.on("close", () => {
    console.warn("⚠️ [warehouse-service] RabbitMQ connection closed. Reconnecting...");
    setTimeout(() => {
      exports.listenEvents().catch(err => {
        console.error("❌ [warehouse-service] Reconnection failed:", err.message);
      });
    }, 5000);
  });
  
  connection.on("error", (err) => {
    console.error("❌ [warehouse-service] RabbitMQ connection error:", err.message);
  });
  
  console.log("✅ [warehouse-service] RabbitMQ listener started successfully");
  } catch (err) {
    console.error("❌ [warehouse-service] Error starting RabbitMQ listener:", err.message);
    console.error("❌ [warehouse-service] Stack:", err.stack);
    throw err;
  }
};
