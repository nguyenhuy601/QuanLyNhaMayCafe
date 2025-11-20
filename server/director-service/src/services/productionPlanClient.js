const { createHttpClient, forwardHeaders, buildHttpError } = require("../utils/httpClient");

const BASE_URL = process.env.GATEWAY_URL || "http://api-gateway:4000";
const httpClient = createHttpClient(BASE_URL);

exports.getPlans = async (req) => {
  try {
    const { data } = await httpClient.get("/plan", {
      headers: forwardHeaders(req),
    });
    return data;
  } catch (error) {
    throw buildHttpError(error, "Không thể lấy danh sách kế hoạch sản xuất");
  }
};

exports.updatePlan = async (req, planId, payload) => {
  try {
    const { data } = await httpClient.put(`/plan/${planId}`, payload, {
      headers: forwardHeaders(req),
    });
    return data;
  } catch (error) {
    throw buildHttpError(error, "Không thể cập nhật kế hoạch");
  }
};

