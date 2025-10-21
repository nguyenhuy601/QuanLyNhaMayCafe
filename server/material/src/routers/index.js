const express = require("express");
const router = express.Router();

router.use("/categories", require("./category.routes"));
router.use("/products", require("./product.routes"));
router.use("/suppliers", require("./supplier.routes"));
router.use("/purchase-receipts", require("./purchaseReceipt.routes"));
router.use("/material-requests", require("./materialRequest.routes"));
router.use("/material-issues", require("./materialIssue.routes"));
router.use("/finished-receipts", require("./finishedReceipt.routes"));
router.use("/finished-issues", require("./finishedIssue.routes"));

module.exports = router;
