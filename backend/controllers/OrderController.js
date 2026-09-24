const ProductModel = require("../models/Product");
const OrderModel = require("../models/Order");

// ─── Add Order / Add to Cart ──────────────────────────────────────────────────
// Called from Collection (add to cart) and Payment (buy now / checkout)
exports.addOrder = async (req, res) => {
  try {
    const { productId, status, quantity, totalPrice } = req.body;

    // Email comes from the authenticated user's session (stored in localStorage)
    // For cart operations, we still use email for backward compat
    const email = req.body.email;

    if (!email || !productId) {
      return res.status(400).json({ message: "Email and Product ID are required" });
    }

    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.status && product.status !== "active") {
      return res.status(400).json({ message: "This product is no longer available." });
    }

    // ─── Stock Check ───────────────────────────────────────────────────────────
    // Only block if count tracking is being used (count > 0 means stock was set)
    // Allow if count is 0 and stockStatus is still "In Stock" (legacy products)
    if (product.stockStatus === "Out of Stock") {
      return res.status(400).json({ message: "Sorry, this product is out of stock." });
    }

    const orderQty = quantity || 1;

    // If count is tracked (count field > 0 or was explicitly set), validate quantity
    if (product.count > 0 && orderQty > product.count) {
      return res.status(400).json({
        message: `Only ${product.count} unit(s) available in stock.`,
        availableCount: product.count,
      });
    }

    const newOrder = new OrderModel({
      email,
      userId: req.user?.id || null,
      // Populate vendorId from the product itself — never from frontend
      vendorId: product.vendorId || null,
      productId,
      status: status || "pending",
      quantity: orderQty,
      // Server-side price calculation — never trust frontend totalPrice
      totalPrice: product.price * orderQty,
    });

    await newOrder.save();

    // ─── Decrement Stock Count ─────────────────────────────────────────────────
    // Only decrement if count tracking is active (count > 0)
    if (product.count > 0) {
      const newCount = Math.max(0, product.count - orderQty);
      const newStockStatus = newCount === 0 ? "Out of Stock" : "In Stock";
      await ProductModel.findByIdAndUpdate(productId, {
        count: newCount,
        stockStatus: newStockStatus,
      });
    }

    return res.status(201).json({ message: "Order created successfully", order: newOrder });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Get All Orders (Admin) ───────────────────────────────────────────────────
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await OrderModel.find()
      .populate("productId")
      .populate("vendorId", "businessName ownerName email")
      .sort({ createdAt: -1 });
    return res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Get Orders by Email (User) ───────────────────────────────────────────────
exports.getOrders = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const orders = await OrderModel.find({ email }).populate("productId").sort({ createdAt: -1 });
    return res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Get Cart Items ───────────────────────────────────────────────────────────
exports.getCartOrders = async (req, res) => {
  try {
    const { email } = req.params;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const orders = await OrderModel.find({ email, status: "cart" })
      .populate("productId")
      .sort({ createdAt: -1 });
    return res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching cart orders:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Update Cart Quantity ─────────────────────────────────────────────────────
exports.updateCartQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!id) return res.status(400).json({ message: "Order ID is required" });
    if (!quantity || quantity < 1)
      return res.status(400).json({ message: "Quantity must be at least 1" });

    const order = await OrderModel.findById(id).populate("productId");
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status !== "cart")
      return res.status(400).json({ message: "Can only update quantity for cart items" });

    const product = order.productId;
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Stock limit check
    if (product.count > 0 && quantity > product.count) {
      return res.status(400).json({
        message: `Only ${product.count} unit(s) available in stock.`,
        availableCount: product.count,
      });
    }

    order.quantity = quantity;
    order.totalPrice = product.price * quantity;
    await order.save();

    return res.status(200).json({ message: "Quantity updated", order });
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Delete Order ─────────────────────────────────────────────────────────────
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Order ID is required" });
    }
    const deletedOrder = await OrderModel.findByIdAndDelete(id);
    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    return res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Get Report (used by OrderController report feature) ─────────────────────
exports.getReport = async (req, res) => {
  try {
    const period = req.query.period || "week";
    const orders = await OrderModel.find().populate("productId");
    const now = new Date();
    let startDate;

    if (period === "week") startDate = new Date(now.setDate(now.getDate() - 7));
    else if (period === "month") startDate = new Date(now.setMonth(now.getMonth() - 1));
    else if (period === "year") startDate = new Date(now.setFullYear(now.getFullYear() - 1));

    const filteredOrders = orders.filter(
      (order) => new Date(order.createdAt) >= startDate
    );

    const productStats = {};
    filteredOrders.forEach((order) => {
      const product = order.productId;
      if (!product) return;
      const name = product.name;
      const qty = order.quantity || 1;
      const price = product.price || 0;

      if (!productStats[name]) productStats[name] = { count: 0, total: 0 };
      productStats[name].count += qty;
      productStats[name].total += qty * price;
    });

    res.status(200).json({ productStats });
  } catch (err) {
    console.error("Error generating report:", err);
    res.status(500).json({ message: "Error generating report" });
  }
};

// ─── Approve Order (Admin) ────────────────────────────────────────────────────
exports.approveOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    const order = await OrderModel.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "approved") {
      return res.status(400).json({ message: "Order is already approved" });
    }

    order.status = "approved";
    await order.save();

    return res.status(200).json({
      message: "Order approved successfully",
      order,
    });
  } catch (error) {
    console.error("Error approving order:", error.message);
    return res.status(500).json({
      message: "Internal server error while approving order",
      error: error.message,
    });
  }
};
