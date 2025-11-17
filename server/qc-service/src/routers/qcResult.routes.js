const express = require("express");
const router = express.Router();
const qcResultController = require("../controllers/qcResult.controller");

// POST /qc-result/ tạo result
router.post("/", qcResultController.createResult);

// GET /qc-result/ lấy tất cả kết quả
router.get("/", qcResultController.getAllResults);

// GET /qc-result/:id lấy 1 result
router.get("/:id", qcResultController.getResultById);

module.exports = router;
