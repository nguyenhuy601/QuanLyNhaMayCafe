const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
require('./src/config/connectdb');

const app = express();
const OrderRoutes = require('./src/routers/order.routes')
const Cusroutes = require('./src/routers/customer.routes');

app.use(cors());
app.use(express.json());

// Gắn route chính

app.use("/orders", OrderRoutes);
app.use("/Customers", Cusroutes);

// Cổng mặc định
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`🚀 Sales-Service running on port ${PORT}`));
