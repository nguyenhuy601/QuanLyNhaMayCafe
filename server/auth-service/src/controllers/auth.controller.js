const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Account = require("../models/Account");

const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

/** Register a new account */
exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Check if email already exists
    const existing = await Account.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    // Validate role (default = worker)
    const validRoles = [
      "worker",
      "director",
      "qc",
      "plan",
      "orders",
      "xuong",
      "totruong",
      "khonvl",
      "warehouseproduct",
    ];
    const finalRole = validRoles.includes(role) ? role : "worker";

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create account
    const account = await Account.create({
      email,
      password: hashed,
      role: finalRole,
    });

    // Generate JWT
    const token = jwt.sign(
      { id: account._id, role: finalRole },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "Register successfully",
      token,
      role: finalRole,
    });
  } catch (err) {
    console.error("❌ [register error]", err);
    res.status(500).json({ error: err.message });
  }
};

/** Login */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const account = await Account.findOne({ email });
    if (!account)
      return res.status(404).json({ message: "Account not found" });

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: account._id, role: account.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token, role: account.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Verify JWT token */
exports.verifyToken = async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: "Missing token" });

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    res.status(200).json({ valid: true, user: decoded });
  } catch {
    res.status(401).json({ valid: false });
  }
};