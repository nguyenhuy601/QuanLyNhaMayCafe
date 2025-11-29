const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

// Log JWT_SECRET info (first 4 chars only for security) - chỉ log 1 lần
if (!process.env.JWT_SECRET_LOGGED) {
  console.log(`🔑 [production-plan-service] JWT_SECRET configured: ${JWT_SECRET.substring(0, 4)}... (length: ${JWT_SECRET.length})`);
  process.env.JWT_SECRET_LOGGED = "true";
}

/**
 * Middleware to verify JWT token
 */
exports.verifyToken = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header)
      return res.status(401).json({ message: "Missing Authorization header" });

    const token = header.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Missing token" });

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token", error: err.message });
  }
};
