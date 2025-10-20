require('dotenv').config();
require('./config/connectdb');
const express = require('express');
const cors = require("cors");
const apiRoutes = require('./routers/index'); // import index.js

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cors());


app.use('/api', apiRoutes);
app.listen(port, ()=>{
    console.log(`Data server đang chạy tại http://localhost:${port}`)
})

module.exports = app;
