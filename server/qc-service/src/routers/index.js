const express = require("express");
const router = express.Router();

router.use("/requests", require("./qcRequest.routes"));
router.use("/results", require("./qcResult.routes"));

module.exports = router;
