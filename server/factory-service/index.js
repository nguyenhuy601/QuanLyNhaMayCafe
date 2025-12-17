const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("./src/config/connectdb");
require("dotenv").config();

const assignmentRoutes = require("./src/routers/assignment.routes");
const logRoutes = require("./src/routers/productionLog.routes");
const teamleaderRoutes = require("./src/routers/teamleader.routes");
const jobRoutes = require("./src/routers/job.routes");
const toRoutes = require("./src/routers/to.routes");
const xuongRoutes = require("./src/routers/xuong.routes");
const caRoutes = require("./src/routers/ca.routes");
const planRoutes = require("./src/routers/plan.routes");
const { listenPlanEvents } = require("./src/rabbitmq/listener");

const app = express();
app.use(cors());
app.use(express.json());

// ============================================
// ROUTES CHO XƯỞNG TRƯỞNG (Manager) - Qua prefix /manager
// ============================================
// Gateway proxy /factory/manager/* vào đây, nên mount tại /manager
app.use("/manager", jobRoutes);
app.use("/manager", assignmentRoutes);
app.use("/manager", logRoutes);
app.use("/manager", planRoutes); // Routes cho xưởng trưởng quản lý kế hoạch

// Mount thêm assignmentRoutes tại root để phục vụ các route cho tổ trưởng:
// - /teamleader/assignments
// - /teamleader/submit-log
app.use("/", assignmentRoutes);

// ============================================
// ROUTES QUẢN LÝ TỔ SẢN XUẤT
// ============================================
// Mount tại cả /to và /factory/to để hỗ trợ cả trường hợp có/không có prefix
app.use("/to", toRoutes);
app.use("/factory/to", toRoutes);

// ============================================
// ROUTES QUẢN LÝ XƯỞNG SẢN XUẤT
// ============================================
// Mount tại cả /xuong và /factory/xuong để hỗ trợ cả trường hợp có/không có prefix
app.use("/xuong", xuongRoutes);
app.use("/factory/xuong", xuongRoutes);

// ============================================
// ROUTES QUẢN LÝ CA LÀM VIỆC
// ============================================
app.use("/ca", caRoutes);

// ============================================
// ROUTES CHO TỔ TRƯỞNG (Team Leader)
// ============================================
// Gateway đã strip prefix /factory rồi, nên mount tại /teamleader
app.use("/teamleader", teamleaderRoutes);

// Nhận event từ kế hoạch sản xuất
listenPlanEvents();

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`🚀 Factory-Service running on port ${PORT}`));
