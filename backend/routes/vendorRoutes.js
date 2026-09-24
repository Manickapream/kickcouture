const express = require("express");
const router = express.Router();
const vendorController = require("../controllers/vendorController");
const vendorProductController = require("../controllers/vendorProductController");
const { verifyToken, requireVendor, requireApprovedVendor } = require("../middleware/auth");

// ─── Public Vendor Auth Routes ────────────────────────────────────────────────
router.post("/register", vendorController.registerVendor);
router.post("/login", vendorController.loginVendor);

// ─── Vendor Profile (any authenticated vendor) ────────────────────────────────
router.get("/profile", verifyToken, ...requireVendor, vendorController.getVendorProfile);
router.put("/profile", verifyToken, ...requireVendor, vendorController.updateVendorProfile);

// ─── Approved Vendor Only ─────────────────────────────────────────────────────
router.get("/dashboard", ...requireApprovedVendor, vendorProductController.getDashboard);

// Product management
router.get("/products", ...requireApprovedVendor, vendorProductController.getVendorProducts);

router.post(
  "/products",
  ...requireApprovedVendor,
  vendorProductController.upload.fields([{ name: 'image', maxCount: 1 }, { name: 'additionalImages', maxCount: 4 }]),
  vendorProductController.addVendorProduct
);

router.put(
  "/products/:id",
  ...requireApprovedVendor,
  vendorProductController.upload.fields([{ name: 'image', maxCount: 1 }, { name: 'additionalImages', maxCount: 4 }]),
  vendorProductController.updateVendorProduct
);

router.delete("/products/:id", ...requireApprovedVendor, vendorProductController.deleteVendorProduct);

// Order management
router.get("/orders", ...requireApprovedVendor, vendorProductController.getVendorOrders);
router.put("/orders/:id/cancel", ...requireApprovedVendor, vendorProductController.cancelOrder);

module.exports = router;
