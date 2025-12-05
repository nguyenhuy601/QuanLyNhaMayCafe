const express = require("express");
const router = express.Router();
const inventoryCtrl = require("../controllers/inventory.controller");

const { verifyToken } = require("../../middlewares/auth.middleware");
const { authorizeRoles } = require("../../middlewares/role.middleware");

// Lấy danh sách nguyên vật liệu
router.get("/materials", verifyToken, authorizeRoles(["khonvl", "khotp", "admin"]), inventoryCtrl.getMaterials);

// Lấy danh sách thành phẩm
router.get("/finished", verifyToken, authorizeRoles(["khonvl", "khotp", "admin"]), inventoryCtrl.getFinishedProducts);

// Lấy tổng quan thông số kho
router.get("/summary", verifyToken, authorizeRoles(["khonvl", "khotp", "admin"]), inventoryCtrl.getInventorySummary);

module.exports = router;


