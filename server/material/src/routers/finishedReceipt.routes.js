const express = require("express");
const router = express.Router();
const controller = require("../controllers/finishedReceipt.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

router.get("/", verifyToken, controller.getAllFinishedReceipts);
router.post("/", verifyToken, authorizeRoles(["QC", "Kho"]), controller.createFinishedReceipt);

module.exports = router;
