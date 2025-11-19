const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
require('./src/config/connectdb');

const app = express();
const userRoutes = require("./src/routers/user.routes");
const roleRoutes = require("./src/routers/role.routes");
const departmentRoutes = require("./src/routers/department.routes");
const positionRoutes = require("./src/routers/position.routes");

app.use(cors());
app.use(express.json());

// Routes
app.use("/users", userRoutes);
app.use("/roles", roleRoutes);
app.use("/departments", departmentRoutes);
app.use("/positions", positionRoutes);

// Cổng mặc định
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`🚀 Admin-Service running on port ${PORT}`));
