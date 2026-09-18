const express = require("express");
const router = express.Router();
const {
  addOrder,
  getAllOrders,
  getOrders,
  deleteOrder,
  approveOrder,
  getCartOrders,
} = require("../controllers/OrderController");

router.post("/add", addOrder);
router.get("/all", getAllOrders);
router.get("/", getOrders);
router.get("/cart/:email", getCartOrders);
router.delete("/:id", deleteOrder);

// ✅ Approve route
router.put("/:id/approve", approveOrder);

module.exports = router;
