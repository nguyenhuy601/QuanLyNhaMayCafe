//const express = require("express");
//const router = express.Router();

// cũ router.use("/issues", require("./finishedIssue.routes"));
// cũ router.use("/receipts", require("./finishedReceipt.routes"));

//router.use("/issues", require("./finishedIssue.routes")); // /products/issues
//router.use("/receipts", require("./finishedReceipt.routes"));

//module.exports = router;

const express = require('express');
const router = express.Router();
const finishedIssueRoutes = require('./finishedIssue.routes');
const finishedReceiptRoutes = require('./finishedReceipt.routes');

router.use('/issues', finishedIssueRoutes);
router.use('/receipts', finishedReceiptRoutes);

module.exports = router;
