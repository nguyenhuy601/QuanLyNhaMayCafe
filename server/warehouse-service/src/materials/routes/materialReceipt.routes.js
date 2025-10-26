const express = require("express");
const router = express.Router();
const receiptCtrl = require("../controllers/materialReceipt.controller");

const { verifyToken } = require("../../middlewares/auth.middleware");
const { authorizeRoles } = require("../../middlewares/role.middleware");

router.get("/receipts", verifyToken, authorizeRoles(["Warehouse", "Admin"]), receiptCtrl.getAllReceipts);
router.post("/receipts", verifyToken, authorizeRoles(["Warehouse", "Admin"]), receiptCtrl.createReceipt);

module.exports = router;
