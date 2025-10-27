const express = require("express");
const router = express.Router();
const controller = require("../controllers/qcRequest.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

router.get("/", verifyToken, authorizeRoles(["QC", "Admin"]), controller.getAllRequests);
router.put("/:id", verifyToken, authorizeRoles(["QC", "Admin"]), controller.updateRequestStatus);

module.exports = router;
