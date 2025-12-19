const express = require("express");
const router = express.Router();
const receiptCtrl = require("../controllers/finishedReceipt.controller");
const issueCtrl = require("../controllers/finishedIssue.controller");
const { verifyToken } = require("../../middlewares/auth.middleware");
const { authorizeRoles } = require("../../middlewares/role.middleware");

router.get("/receipts", verifyToken, authorizeRoles(["admin", "totruong", "xuongtruong","khotp","khonvl","qc"]), receiptCtrl.getAllFinishedReceipts);
router.post("/receipts", verifyToken, authorizeRoles(["admin", "totruong", "xuongtruong","khotp","khonvl","qc"]), receiptCtrl.createFinishedReceipt);
router.put("/receipts/:id/confirm", verifyToken, authorizeRoles(["admin", "khotp"]), receiptCtrl.confirmReceipt);
router.delete("/receipts/:id", verifyToken, authorizeRoles(["admin", "totruong", "xuongtruong","khotp","khonvl","qc"]), receiptCtrl.deleteFinishedReceipt);
// Route migration để cập nhật trạng thái cho phiếu nhập thành phẩm cũ
router.post("/receipts/migrate-status", verifyToken, authorizeRoles(["admin", "khotp"]), receiptCtrl.migrateReceiptStatus);

module.exports = router;
