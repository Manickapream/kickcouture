const jwt = require("jsonwebtoken");
const Vendor = require("../models/Vendor");

// ─── Verify JWT Token ────────────────────────────────────────────────────────
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, vendorId? }
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired. Please log in again." });
    }
    return res.status(401).json({ message: "Invalid token." });
  }
};

// ─── Require Specific Role(s) ────────────────────────────────────────────────
exports.requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${roles.join(" or ")}.`,
      });
    }
    next();
  };
};

// ─── Shorthand Middleware ────────────────────────────────────────────────────
exports.requireAdmin = [
  exports.verifyToken,
  exports.requireRole("admin"),
];

exports.requireVendor = [
  exports.verifyToken,
  exports.requireRole("vendor"),
];

// ─── Require Approved Vendor (checks DB status) ──────────────────────────────
exports.requireApprovedVendor = [
  exports.verifyToken,
  exports.requireRole("vendor"),
  async (req, res, next) => {
    try {
      const vendor = await Vendor.findById(req.user.vendorId);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor account not found." });
      }
      if (vendor.status !== "approved") {
        return res.status(403).json({
          message: `Vendor account is ${vendor.status}. Only approved vendors can perform this action.`,
          status: vendor.status,
        });
      }
      req.vendor = vendor;
      next();
    } catch (err) {
      return res.status(500).json({ message: "Authorization check failed.", error: err.message });
    }
  },
];
