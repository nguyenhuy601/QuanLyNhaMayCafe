const express = require("express");
const router = express.Router();
const planController = require("../controllers/productionPlan.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

// Lấy danh sách kế hoạch
router.get("/", verifyToken, planController.getAllPlans);

// Tạo kế hoạch sản xuất
router.post("/", verifyToken, authorizeRoles(["Admin", "Kế hoạch"]), planController.createPlan);

// Cập nhật kế hoạch
router.put("/:id", verifyToken, authorizeRoles(["Admin", "Kế hoạch"]), planController.updatePlan);

module.exports = router;
