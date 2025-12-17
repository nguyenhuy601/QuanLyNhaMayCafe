const express = require("express");
const router = express.Router();
const receiptCtrl = require("../controllers/materialReceipt.controller");

const { verifyToken } = require("../../middlewares/auth.middleware");
const { authorizeRoles } = require("../../middlewares/role.middleware");

router.get("/", verifyToken, authorizeRoles(["khonvl", "khotp", "admin", "xuongtruong"]), receiptCtrl.getAllReceipts);
router.get("/pending", verifyToken, authorizeRoles(["khonvl", "khotp", "admin", "director"]), receiptCtrl.getPendingReceipts);
router.post("/", verifyToken, authorizeRoles(["khonvl", "khotp", "admin"]), (req, res, next) => {
  console.log("🔵 [warehouse-service] POST /materials/receipts - Creating new receipt");
  console.log("🔵 [warehouse-service] Request body:", JSON.stringify(req.body, null, 2));
  console.log("🔵 [warehouse-service] Request headers:", JSON.stringify(req.headers, null, 2));
  next();
}, receiptCtrl.createReceipt);
router.put("/:id/approve", verifyToken, authorizeRoles(["khonvl", "khotp", "admin", "director"]), (req, res, next) => {
  console.log("🟢 [warehouse-service] PUT /materials/receipts/:id/approve - Approving receipt:", req.params.id);
  next();
}, receiptCtrl.approveReceipt);

module.exports = router;
