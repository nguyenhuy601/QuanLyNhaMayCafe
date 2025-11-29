const { createHttpClient, forwardHeaders, buildHttpError } = require("../utils/httpClient");

const BASE_URL = process.env.GATEWAY_URL || "http://api-gateway:4000";
const httpClient = createHttpClient(BASE_URL);

exports.getOrders = async (req) => {
  try {
    const { data } = await httpClient.get("/orders", {
      headers: forwardHeaders(req),
    });
    return data;
  } catch (error) {
    throw buildHttpError(error, "Không thể lấy danh sách đơn hàng");
  }
};

exports.updateOrder = async (req, orderId, payload) => {
  try {
    const { data } = await httpClient.put(`/orders/${orderId}`, payload, {
      headers: forwardHeaders(req),
    });
    return data;
  } catch (error) {
    throw buildHttpError(error, "Không thể cập nhật đơn hàng");
  }
};

exports.getPendingOrders = async (req) => {
  try {
    const { data } = await httpClient.get("/orders/pending", {
      headers: forwardHeaders(req),
    });
    return data;
  } catch (error) {
    throw buildHttpError(error, "Không thể lấy danh sách đơn hàng chờ duyệt");
  }
};

