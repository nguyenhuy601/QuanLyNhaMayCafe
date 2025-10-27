const express = require("express");
const router = express.Router();

router.use("/issues", require("./finishedIssue.routes"));
router.use("/issues", require("./finishedReceipt.routes"));

module.exports = router;