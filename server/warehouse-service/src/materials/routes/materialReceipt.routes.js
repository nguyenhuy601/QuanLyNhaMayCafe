const express = require("express");
const router = express.Router();
const receiptCtrl = require("../controllers/materialReceipt.controller");

const { verifyToken } = require("../../middlewares/auth.middleware");
const { authorizeRoles } = require("../../middlewares/role.middleware");

router.get("/", verifyToken, authorizeRoles(["khonvl", "khotp", "admin"]), receiptCtrl.getAllReceipts);
router.post("/", verifyToken, authorizeRoles(["khonvl", "khotp", "admin"]), receiptCtrl.createReceipt);
router.put("/:id/approve", verifyToken, authorizeRoles(["khonvl", "khotp", "admin", "director"]), receiptCtrl.approveReceipt);

module.exports = router;
