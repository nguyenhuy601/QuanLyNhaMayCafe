const express = require("express");
const router = express.Router();
const receiptCtrl = require("../controllers/finishedReceipt.controller");
const issueCtrl = require("../controllers/finishedIssue.controller");
const { verifyToken } = require("../../middlewares/auth.middleware");
const { authorizeRoles } = require("../../middlewares/role.middleware");

router.get("/receipts", verifyToken, authorizeRoles(["Warehouse", "Admin", "QC"]), receiptCtrl.getAllFinishedReceipts);

module.exports = router;
