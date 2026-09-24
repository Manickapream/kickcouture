const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const productController = require("../controllers/productController");
const { requireAdmin, verifyToken } = require("../middleware/auth");

// Multer storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ─── Public Routes ────────────────────────────────────────────────────────────
// Returns only active products for customer catalog
router.get("/get", productController.getProducts);

// ─── User Routes ──────────────────────────────────────────────────────────────
router.post("/:id/review", verifyToken, productController.addProductReview);
router.put("/:id/review", verifyToken, productController.updateProductReview);
router.delete("/:id/review", verifyToken, productController.deleteProductReview);

// ─── Admin-only Routes ────────────────────────────────────────────────────────
router.post("/add", ...requireAdmin, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'additionalImages', maxCount: 4 }]), productController.addProduct);
router.put("/:id", ...requireAdmin, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'additionalImages', maxCount: 4 }]), productController.updateProduct);
router.delete("/:id", ...requireAdmin, productController.deleteProduct);

module.exports = router;
