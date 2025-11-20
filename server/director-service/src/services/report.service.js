const salesClient = require("./salesClient");
const productionPlanClient = require("./productionPlanClient");
const { publishEvent } = require("../utils/eventPublisher");
const { HttpClientError } = require("../utils/httpClient");

const filterPendingOrders = (orders = []) =>
  orders.filter((order) => (order?.trangThai || "").toLowerCase() === "chờ duyệt");

const filterPendingPlans = (plans = []) =>
  plans.filter((plan) => plan?.trangThai === "Chưa duyệt");

const getPendingOrders = async (req) => {
  const orders = await salesClient.getOrders(req);
  return filterPendingOrders(orders);
};

const getPendingPlans = async (req) => {
  const plans = await productionPlanClient.getPlans(req);
  return filterPendingPlans(plans);
};

const getPendingSummary = async (req) => {
  const [ordersResult, plansResult] = await Promise.allSettled([
    getPendingOrders(req),
    getPendingPlans(req),
  ]);

  const summary = {
    orders: [],
    plans: [],
    partialErrors: [],
  };

  if (ordersResult.status === "fulfilled") {
    summary.orders = ordersResult.value;
  } else {
    const reason = ordersResult.reason;
    summary.partialErrors.push({
      scope: "orders",
      status: reason.status || 500,
      ...(reason.body || { message: reason.message }),
    });
  }

  if (plansResult.status === "fulfilled") {
    summary.plans = plansResult.value;
  } else {
    const reason = plansResult.reason;
    summary.partialErrors.push({
      scope: "plans",
      status: reason.status || 500,
      ...(reason.body || { message: reason.message }),
    });
  }

  if (summary.partialErrors.length === 2) {
    const status =
      summary.partialErrors[0].status || summary.partialErrors[1].status || 502;
    throw new HttpClientError(status, {
      message: "Không thể lấy danh sách phê duyệt",
      errors: summary.partialErrors,
    });
  }

  return summary;
};

const approveOrder = async (req) => {
  const payload = {
    trangThai: "Đã duyệt",
    nguoiDuyet: req.user?.username || "director",
    ngayDuyet: new Date().toISOString(),
  };

  const updated = await salesClient.updateOrder(req, req.params.id, payload);
  await publishEvent("ORDER_APPROVED", updated);
  return updated;
};

const rejectOrder = async (req) => {
  const reason = req.body?.reason || req.body?.ghiChu;
  const payload = {
    trangThai: "Đã hủy",
    ghiChu: reason ? `[Director Reject] ${reason}` : undefined,
  };

  const updated = await salesClient.updateOrder(req, req.params.id, payload);
  return updated;
};

const approvePlan = async (req) => {
  const payload = {
    trangThai: "Đã duyệt",
    nguoiDuyet: req.user?.username || "director",
    ngayDuyet: new Date().toISOString(),
  };

  const updated = await productionPlanClient.updatePlan(req, req.params.id, payload);
  await publishEvent("PLAN_APPROVED", updated);
  return updated;
};

const rejectPlan = async (req) => {
  const reason = req.body?.reason || req.body?.ghiChu || "Không đạt yêu cầu";
  const payload = {
    trangThai: "Chưa duyệt",
    ghiChu: `[Director Reject] ${reason}`,
  };

  const updated = await productionPlanClient.updatePlan(req, req.params.id, payload);
  return updated;
};

module.exports = {
  getPendingOrders,
  getPendingPlans,
  getPendingSummary,
  approveOrder,
  rejectOrder,
  approvePlan,
  rejectPlan,
};

