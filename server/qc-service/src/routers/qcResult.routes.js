const express = require("express");
const router = express.Router();
const controller = require("../controllers/qcResult.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

router.get("/", verifyToken, authorizeRoles(["QC", "Admin", "Director"]), controller.getAllResults);
router.post("/", verifyToken, authorizeRoles(["QC", "Admin"]), controller.createResult);

module.exports = router;
