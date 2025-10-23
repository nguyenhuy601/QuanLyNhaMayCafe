const express = require("express");
const router = express.Router();
const controller = require("../controllers/productionLog.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

router.get("/", verifyToken, authorizeRoles(["Factory", "Admin", "QC"]), controller.getLogs);
router.put("/finish/:id", verifyToken, authorizeRoles(["Factory", "Admin"]), controller.finishProduction);

module.exports = router;
