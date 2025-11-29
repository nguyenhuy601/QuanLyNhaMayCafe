const salesClient = require("./salesClient");
const productionPlanClient = require("./productionPlanClient");
const { publishEvent } = require("../utils/eventPublisher");
const { HttpClientError } = require("../utils/httpClient");

const normalizeStatus = (value = "") =>
  value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const PENDING_STATUSES = ["cho duyet", "chua duyet", "dang cho duyet", "pending"];

const filterPendingPlans = (plans = []) => {
  const allowedStatuses = new Set(PENDING_STATUSES);
  return plans.filter((plan) => allowedStatuses.has(normalizeStatus(plan.trangThai)));
};

const getPendingOrders = async (req) => {
  try {
    const orders = await salesClient.getPendingOrders(req);
    console.log(`📦 Director: Received ${orders?.length || 0} pending orders from sales-service`);
    
    if (!Array.isArray(orders)) {
      console.warn("⚠️ Director: Orders is not an array:", orders);
      return [];
    }
    
    return orders;
  } catch (error) {
    console.error("❌ Director: Error getting pending orders:", error.message);
    throw error;
  }
};

const getPendingPlans = async (req) => {
  try {
    const plans = await productionPlanClient.getPlans(req);
    console.log(`📋 Director: Received ${plans?.length || 0} plans from production-plan-service`);
    
    if (!Array.isArray(plans)) {
      console.warn("⚠️ Director: Plans is not an array:", plans);
      return [];
    }
    
    const filtered = filterPendingPlans(plans);
    console.log(`✅ Director: Filtered to ${filtered.length} pending plans`);
    
    // Log statuses for debugging
    if (plans.length > 0) {
      const statuses = plans.map(p => p.trangThai);
      console.log(`📊 Director: Plan statuses:`, statuses);
    }
    
    return filtered;
  } catch (error) {
    console.error("❌ Director: Error getting pending plans:", error.message);
    throw error;
  }
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
  const reason = req.body?.reason || req.body?.lyDoTuChoi || req.body?.ghiChu;
  const payload = {
    trangThai: "Từ chối",
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
  const reason =
    req.body?.reason ||
    req.body?.lyDoTuChoi ||
    req.body?.ghiChu ||
    "Không đạt yêu cầu";
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

