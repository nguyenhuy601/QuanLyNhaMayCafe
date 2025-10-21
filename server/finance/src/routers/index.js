const express = require("express");
const router = express.Router();

router.use("/payments", require("./paymentVoucher.routes"));

module.exports = router;
