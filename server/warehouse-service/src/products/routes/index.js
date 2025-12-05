const express = require("express");
const router = express.Router();

router.use("/issues", require("./finishedIssue.routes"));
router.use("/issues", require("./finishedReceipt.routes"));
router.use("/", require("./inventory.routes")); // Thêm routes cho inventory

module.exports = router;