const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
require("./src/config/connectdb");

const materialRoutes = require("./src/materials/routes/index");
const productRoutes = require("./src/products/routes/index");
const { listenEvents } = require("./src/rabbitmq/listener");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/materials", materialRoutes);
app.use("/products", productRoutes);

listenEvents();

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`🚀 Warehouse-Service running on port ${PORT}`));
