const express = require("express");
const router = express.Router();
const controller = require("../controllers/defectCategory.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

// Lấy danh sách loại lỗi
router.get("/", verifyToken, controller.getAllDefects);

// Tạo loại lỗi mới
router.post("/", verifyToken, authorizeRoles(["Admin", "QC trưởng"]), controller.createDefect);

// Cập nhật loại lỗi
router.put("/:id", verifyToken, authorizeRoles(["Admin", "QC trưởng"]), controller.updateDefect);

// Xóa loại lỗi
router.delete("/:id", verifyToken, authorizeRoles(["Admin"]), controller.deleteDefect);

module.exports = router;
