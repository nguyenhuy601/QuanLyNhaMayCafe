const express = require("express");
const router = express.Router();

router.use("/workshops", require("./workshop.routes"));
router.use("/teams", require("./team.routes"));
router.use("/shifts", require("./workShift.routes"));
router.use("/assignments", require("./workAssignment.routes"));
router.use("/plans", require("./productionPlan.routes"));
router.use("/logs", require("./productionLog.routes"));

module.exports = router;
