const express = require("express");
const router = express.Router();

router.use("/receipts", require("./materialIssue.routes"));
router.use("/receipts", require("./materialReceipt.routes"));

module.exports = router;
