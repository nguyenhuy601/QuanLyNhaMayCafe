const express = require("express");
const router = express.Router();

router.use("/defects", require("./defectCategory.routes"));
router.use("/requests", require("./qcRequest.routes"));
router.use("/results", require("./qcResult.routes"));

module.exports = router;
