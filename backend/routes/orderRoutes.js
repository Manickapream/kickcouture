const express = require("express");
const router = express.Router();
const {
  addOrder,
  getAllOrders,
  getOrders,
  deleteOrder,
  approveOrder,
  getCartOrders,
  updateCartQuantity,
} = require("../controllers/OrderController");
const { verifyToken, requireAdmin } = require("../middleware/auth");

// ─── Public/User Routes ───────────────────────────────────────────────────────
// Add to cart or create order — user must be logged in
router.post("/add", verifyToken, addOrder);

// Get user's own orders (filtered by email from query — user must be logged in)
router.get("/", verifyToken, getOrders);

// Get user's cart items
router.get("/cart/:email", verifyToken, getCartOrders);

// Update cart item quantity
router.patch("/:id/quantity", verifyToken, updateCartQuantity);

// Delete an order (user can delete their own non-approved orders)
router.delete("/:id", verifyToken, deleteOrder);

// ─── Admin-only Routes ────────────────────────────────────────────────────────
router.get("/all", ...requireAdmin, getAllOrders);
router.put("/:id/approve", ...requireAdmin, approveOrder);

module.exports = router;
