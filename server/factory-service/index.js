const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("./src/config/connectdb");
require("dotenv").config();

const assignmentRoutes = require("./src/routers/assignment.routes");
const logRoutes = require("./src/routers/productionLog.routes");
const teamleaderRoutes = require("./src/routers/teamleader.routes");
const { listenPlanEvents } = require("./src/rabbitmq/listener");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/", assignmentRoutes);
app.use("/", logRoutes);
app.use("/teamleader", teamleaderRoutes);
app.use("/factory/teamleader", teamleaderRoutes);

// Nhận event từ kế hoạch sản xuất
listenPlanEvents();

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`🚀 Factory-Service running on port ${PORT}`));
