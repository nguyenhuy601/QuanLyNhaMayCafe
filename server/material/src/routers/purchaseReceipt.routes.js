const express = require("express");
const router = express.Router();
const controller = require("../controllers/purchaseReceipt.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

router.get("/", verifyToken, controller.getAllPurchaseReceipts);
router.post("/", verifyToken, authorizeRoles(["Admin", "Kho"]), controller.createPurchaseReceipt);
router.put("/:id", verifyToken, authorizeRoles(["Admin", "Kho"]), controller.updatePurchaseReceipt);

module.exports = router;
