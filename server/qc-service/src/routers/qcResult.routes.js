const express = require("express");
const router = express.Router();
const qcResultController = require("../controllers/qcResult.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

// POST /qc-result/ tạo result
router.post("/", verifyToken, authorizeRoles(["qc", "admin", "khotp"]), qcResultController.createResult);

// GET /qc-result/ lấy tất cả kết quả
router.get("/", verifyToken, authorizeRoles(["qc", "admin", "khotp", "khonvl", "totruong", "xuongtruong"]), qcResultController.getAllResults);

// GET /qc-result/:id lấy 1 result
router.get("/:id", verifyToken, authorizeRoles(["qc", "admin", "khotp", "khonvl", "totruong", "xuongtruong"]), qcResultController.getResultById);

module.exports = router;
