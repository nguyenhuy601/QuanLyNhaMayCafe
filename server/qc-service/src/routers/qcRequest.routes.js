const express = require("express");
const router = express.Router();
const qcRequestController = require("../controllers/qcRequest.controller");

// POST /qc-request/  tạo
router.post("/", qcRequestController.createTempRequest);

// GET /qc-request/  lấy tất cả
router.get("/", qcRequestController.getAllRequests);

// GET /qc-request/:id  lấy 1
router.get("/:id", qcRequestController.getRequestById);

// PATCH /qc-request/:id  cập nhật trạng thái/ghi chú
router.patch("/:id", qcRequestController.updateRequestStatus);

module.exports = router;
