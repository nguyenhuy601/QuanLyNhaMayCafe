const axios = require("axios");

class HttpClientError extends Error {
  constructor(status, body) {
    super(body?.message || "Lỗi khi gọi service");
    this.name = "HttpClientError";
    this.status = status;
    this.body = body;
  }
}

const createHttpClient = (baseURL) =>
  axios.create({
    baseURL,
    timeout: Number(process.env.HTTP_CLIENT_TIMEOUT || 10000),
  });

const forwardHeaders = (req) => {
  const headers = {
    "x-service-source": "director-service",
  };

  if (req.headers.authorization) headers.Authorization = req.headers.authorization;
  if (req.headers["x-request-id"]) headers["x-request-id"] = req.headers["x-request-id"];

  return headers;
};

const buildHttpError = (error, fallbackMessage) => {
  if (error.response) {
    return new HttpClientError(error.response.status, error.response.data || { message: fallbackMessage });
  }

  if (error.request) {
    return new HttpClientError(502, { message: `${fallbackMessage}: service không phản hồi` });
  }

  return new HttpClientError(500, { message: `${fallbackMessage}: ${error.message}` });
};

module.exports = {
  createHttpClient,
  forwardHeaders,
  buildHttpError,
  HttpClientError,
};

