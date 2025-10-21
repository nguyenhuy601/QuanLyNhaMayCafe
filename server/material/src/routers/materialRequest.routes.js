const express = require("express");
const router = express.Router();
const controller = require("../controllers/materialRequest.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

router.get("/", verifyToken, controller.getAllRequests);
router.post("/", verifyToken, authorizeRoles(["Xưởng trưởng", "Tổ trưởng"]), controller.createRequest);
router.put("/:id", verifyToken, authorizeRoles(["Kho", "Admin"]), controller.updateRequestStatus);

module.exports = router;
