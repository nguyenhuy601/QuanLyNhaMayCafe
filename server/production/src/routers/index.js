const express = require('express');
const router = express.Router();

// ================= ADMIN =================
const roleRouter = require('./Admin/roleRouter');
const userRouter = require('./Admin/userRouter');

// ================= FACTORY MANAGER =================
const factoryRouter = require('./FactoryManager/factoryRouter');
const teamRouter = require('./FactoryManager/teamRouter');
const workerRouter = require('./FactoryManager/workerRouter');
const shiftRouter = require('./FactoryManager/shiftRouter');
const productionPlanRouter = require('./FactoryManager/productionPlanRouter');
const workAssignmentRouter = require('./FactoryManager/workAssignmentRouter');

// ================= WAREHOUSE STAFF =================
const warehouseRouter = require('./WareHouseStaff/warehouseRouter');
const materialRouter = require('./WareHouseStaff/materialRouter');
const supplierRouter = require('./WareHouseStaff/supplierRouter');
const planMaterialRouter = require('./WareHouseStaff/planMaterialRouter');
const materialReceiptRouter = require('./WareHouseStaff/materialReceiptRouter');
const materialIssueRouter = require('./WareHouseStaff/materialIssueRouter');
const materialRequestRouter = require('./WareHouseStaff/materialRequestRouter');
const materialInventoryRouter = require('./WareHouseStaff/materialInventoryRouter');
const productRouter = require('./WareHouseStaff/productRouter');
const finishedGoodsReceiptRouter = require('./WareHouseStaff/finishedGoodsReceiptRouter');
const finishedGoodsIssueRouter = require('./WareHouseStaff/finishedGoodsIssueRouter');
const finishedGoodsInventoryRouter = require('./WareHouseStaff/finishedGoodsInventoryRouter');

// ================= WORKER =================
const attendanceRouter = require('./Worker/attendanceRouter');
const payrollRouter = require('./Worker/payrollRouter');

// ================= QC =================
const qcRequestRouter = require('./QC/qcRequestRouter');
const qcResultRouter = require('./QC/qcResultRouter');
const qcLevelRouter = require('./QC/qcLevelRouter');
const qcResultClassificationRouter = require('./QC/qcResultClassificationRouter');

// ================= MANAGEMENT =================
const reportRouter = require('./Management/reportRouter');

// ================= REGISTER ROUTES =================
router.use('/roles', roleRouter);
router.use('/users', userRouter);

router.use('/factories', factoryRouter);
router.use('/teams', teamRouter);
router.use('/workers', workerRouter);
router.use('/shifts', shiftRouter);
router.use('/production-plans', productionPlanRouter);
router.use('/work-assignments', workAssignmentRouter);

router.use('/warehouses', warehouseRouter);
router.use('/materials', materialRouter);
router.use('/suppliers', supplierRouter);
router.use('/plan-materials', planMaterialRouter);
router.use('/material-receipts', materialReceiptRouter);
router.use('/material-issues', materialIssueRouter);
router.use('/material-requests', materialRequestRouter);
router.use('/material-inventories', materialInventoryRouter);
router.use('/products', productRouter);
router.use('/finished-goods-receipts', finishedGoodsReceiptRouter);
router.use('/finished-goods-issues', finishedGoodsIssueRouter);
router.use('/finished-goods-inventories', finishedGoodsInventoryRouter);

router.use('/attendances', attendanceRouter);
router.use('/payrolls', payrollRouter);

router.use('/qc-requests', qcRequestRouter);
router.use('/qc-results', qcResultRouter);
router.use('/qc-levels', qcLevelRouter);
router.use('/qc-result-classifications', qcResultClassificationRouter);

router.use('/reports', reportRouter);

module.exports = router;
