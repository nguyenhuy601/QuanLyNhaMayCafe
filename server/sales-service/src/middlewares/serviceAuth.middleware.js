/**
 * Middleware xác thực service-to-service calls
 * Kiểm tra X-Service-Secret header để cho phép warehouse-service cập nhật số lượng
 */
exports.verifyServiceSecret = (req, res, next) => {
  const SERVICE_SECRET = process.env.SERVICE_SECRET || "warehouse-service-secret-key";
  const serviceSecret = req.headers['x-service-secret'];
  
  if (!serviceSecret || serviceSecret !== SERVICE_SECRET) {
    return res.status(401).json({ 
      message: "Unauthorized: Invalid service secret",
      error: "This endpoint requires a valid service secret key"
    });
  }
  
  next();
};






















