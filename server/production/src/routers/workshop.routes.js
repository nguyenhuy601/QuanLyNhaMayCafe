const express = require("express");
const router = express.Router();
const workshopController = require("../controllers/workshop.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

// Lấy danh sách xưởng
router.get("/", verifyToken, workshopController.getAllWorkshops);

// Tạo xưởng mới
router.post("/", verifyToken, authorizeRoles(["Admin", "Kế hoạch"]), workshopController.createWorkshop);

// Cập nhật xưởng
router.put("/:id", verifyToken, authorizeRoles(["Admin", "Kế hoạch"]), workshopController.updateWorkshop);

module.exports = router;
