const express = require("express");
const router = express.Router();

router.use("/receipts", require("./materialReceipt.routes"));
router.use("/issues", require("./materialIssue.routes"));
router.use("/requests", require("./materialRequest.routes"));

module.exports = router;
