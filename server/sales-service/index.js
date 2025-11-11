const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
require('./src/config/connectdb');
require('./src/models/Employee');
require('./src/models/Product');

const app = express();
const OrderRoutes = require('./src/routers/order.routes')
const Cusroutes = require('./src/routers/customer.routes');
const Products = require('./src/routers/product.routes');


app.use(cors());
app.use(express.json());

// Gắn route chính

app.use("/orders", OrderRoutes);
// normalize to lowercase path
app.use("/customers", Cusroutes);
app.use("/products", Products);

// Cổng mặc định
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`🚀 Sales-Service running on port ${PORT}`));
