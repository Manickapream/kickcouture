const express = require("express");
const router = express.Router();
const { adminLogin } = require("../controllers/adminController");
const adminVendorController = require("../controllers/adminVendorController");
const productController = require("../controllers/productController");
const { requireAdmin } = require("../middleware/auth");

// ─── Public ───────────────────────────────────────────────────────────────────
router.post("/login", adminLogin);

// ─── Vendor Management (Admin only) ──────────────────────────────────────────
router.get("/vendors", ...requireAdmin, adminVendorController.getAllVendors);
router.get("/vendors/:id", ...requireAdmin, adminVendorController.getVendorById);
router.patch("/vendors/:id/approve", ...requireAdmin, adminVendorController.approveVendor);
router.patch("/vendors/:id/reject", ...requireAdmin, adminVendorController.rejectVendor);
router.patch("/vendors/:id/suspend", ...requireAdmin, adminVendorController.suspendVendor);
router.patch("/vendors/:id/reactivate", ...requireAdmin, adminVendorController.reactivateVendor);

// ─── Reports (Admin only) ─────────────────────────────────────────────────────
router.get("/reports", ...requireAdmin, adminVendorController.getReports);

// ─── Product Management (Admin only — all products including inactive) ─────────
router.get("/products", ...requireAdmin, productController.getAllProductsAdmin);

module.exports = router;
