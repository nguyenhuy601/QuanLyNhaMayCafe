const express = require("express");
const router = express.Router();

const controller = require("../controllers/teamleader.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const TEAMLEADER_ROLES = ["xuongtruong", "totruong"];

// Attendance routes
router.get( "/attendance", verifyToken, authorizeRoles(TEAMLEADER_ROLES), controller.listAttendanceSheets);
router.post( "/attendance", verifyToken, authorizeRoles(TEAMLEADER_ROLES), controller.saveAttendanceSheet);
router.post( "/attendance/:id/workers", verifyToken, authorizeRoles(TEAMLEADER_ROLES), controller.addAttendanceEntry);
router.patch( "/attendance/:id/workers/:entryId", verifyToken, authorizeRoles(TEAMLEADER_ROLES), controller.updateAttendanceEntry);
router.delete( "/attendance/:id/workers/:entryId", verifyToken, authorizeRoles(TEAMLEADER_ROLES), controller.removeAttendanceEntry);
router.patch( "/attendance/:id/status", verifyToken, authorizeRoles(TEAMLEADER_ROLES), controller.updateAttendanceStatus);

// Shift schedule routes
router.get( "/shifts", verifyToken, authorizeRoles(TEAMLEADER_ROLES), controller.listShiftSchedules);
router.post( "/shifts", verifyToken, authorizeRoles(TEAMLEADER_ROLES), controller.saveShiftSchedule);
router.post( "/shifts/:id/members", verifyToken, authorizeRoles(TEAMLEADER_ROLES), controller.addShiftMember);
router.patch( "/shifts/:id/members/:memberId", verifyToken, authorizeRoles(TEAMLEADER_ROLES), controller.updateShiftMember);
router.delete( "/shifts/:id/members/:memberId", verifyToken, authorizeRoles(TEAMLEADER_ROLES), controller.removeShiftMember);
router.delete( "/shifts/:id", verifyToken, authorizeRoles(TEAMLEADER_ROLES), controller.deleteShiftSchedule);

module.exports = router;

