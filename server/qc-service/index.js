const express = require("express");
require("dotenv").config();
require("./src/config/connectdb"); // đảm bảo connectdb xuất mongoose.connect
const cors = require("cors");

const qcRequestRoute = require("./src/routers/qcRequest.routes");
const qcResultRoute = require("./src/routers/qcResult.routes");
const { listenFactoryEvents } = require("./src/rabbitmq/listener"); // giữ nếu bạn có listener

const app = express();
app.use(cors());
app.use(express.json());

// mount routers
app.use("/qc-request", qcRequestRoute);
app.use("/qc-result", qcResultRoute);

// Cổng mặc định
const PORT = process.env.PORT || 3006;
app.listen(PORT, () => console.log(`🚀 QC-Service running on port ${PORT}`));

(async () => {
  try {
    await listenFactoryEvents();
    console.log("✅ RabbitMQ listener started");
  } catch (error) {
    console.error("❌ Failed to connect to RabbitMQ:", error.message);
  }
})();

