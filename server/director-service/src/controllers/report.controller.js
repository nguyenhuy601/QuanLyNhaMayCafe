const reportService = require("../services/report.service");
const { HttpClientError } = require("../utils/httpClient");

const handleError = (res, error, fallbackMessage) => {
  if (error instanceof HttpClientError) {
    return res.status(error.status).json(error.body);
  }

  console.error("❌ Report controller error:", error.message);
  return res
    .status(500)
    .json({ message: fallbackMessage || "Có lỗi xảy ra trong director-service" });
};

exports.getPendingOrders = async (req, res) => {
  try {
    const orders = await reportService.getPendingOrders(req);
    res.status(200).json(orders);
  } catch (error) {
    handleError(res, error, "Không thể lấy danh sách đơn hàng chờ duyệt");
  }
};

exports.getPendingPlans = async (req, res) => {
  try {
    const plans = await reportService.getPendingPlans(req);
    res.status(200).json(plans);
  } catch (error) {
    handleError(res, error, "Không thể lấy danh sách kế hoạch chờ duyệt");
  }
};

exports.getPendingSummary = async (req, res) => {
  try {
    const summary = await reportService.getPendingSummary(req);
    if (summary.partialErrors.length) {
      return res.status(206).json(summary);
    }
    res.status(200).json(summary);
  } catch (error) {
    handleError(res, error, "Không thể tổng hợp dữ liệu duyệt");
  }
};

exports.approveOrder = async (req, res) => {
  try {
    const order = await reportService.approveOrder(req);
    res.status(200).json({ message: "Đã duyệt đơn hàng", order });
  } catch (error) {
    handleError(res, error, "Không thể duyệt đơn hàng");
  }
};

exports.rejectOrder = async (req, res) => {
  try {
    const order = await reportService.rejectOrder(req);
    res.status(200).json({ message: "Đơn hàng bị từ chối", order });
  } catch (error) {
    handleError(res, error, "Không thể từ chối đơn hàng");
  }
};

exports.approvePlan = async (req, res) => {
  try {
    const plan = await reportService.approvePlan(req);
    res.status(200).json({ message: "Đã duyệt kế hoạch", plan });
  } catch (error) {
    handleError(res, error, "Không thể duyệt kế hoạch");
  }
};

exports.rejectPlan = async (req, res) => {
  try {
    const plan = await reportService.rejectPlan(req);
    res.status(200).json({ message: "Kế hoạch bị từ chối", plan });
  } catch (error) {
    handleError(res, error, "Không thể từ chối kế hoạch");
  }
};

