const express = require("express");
const router = express.Router();
const controller = require("../controllers/lot.controller");

// Routes cho lô sản xuất (không cần auth vì được gọi từ service khác)
router.put("/update-from-qc-request", controller.updateFromQcRequest);
router.put("/update-from-qc-result", controller.updateFromQcResult);
router.get("/", controller.getAllLots);
router.get("/:id", controller.getLotById);
router.put("/:id", controller.updateLot);
router.delete("/plan/:planId", controller.deleteLotsByPlanId);
// Route migration để cập nhật trạng thái cho lô cũ
router.post("/migrate-status", controller.migrateLotStatus);

module.exports = router;

