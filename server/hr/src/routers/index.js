const express = require("express");
const router = express.Router();

router.use("/positions", require("./position.routes"));
router.use("/employees", require("./employee.routes"));
router.use("/shifts", require("./workShift.routes"));
router.use("/attendance", require("./attendance.routes"));
router.use("/salary", require("./salary.routes"));

module.exports = router;
