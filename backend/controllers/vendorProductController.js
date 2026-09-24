const Product = require("../models/Product");
const Order = require("../models/Order");
const Vendor = require("../models/Vendor");
const multer = require("multer");
const path = require("path");

// ─── Multer config for vendor product images ──────────────────────────────────
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, "vendor_" + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|avif/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error("Only image files are allowed (jpeg, jpg, png, webp, avif)."));
  },
});

exports.upload = upload;

// ─── GET /api/vendor/dashboard ────────────────────────────────────────────────
exports.getDashboard = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;

    const productCount = await Product.countDocuments({ vendorId, status: "active" });
    const allProductIds = (await Product.find({ vendorId }, "_id")).map((p) => p._id);

    const orders = await Order.find({
      vendorId,
      status: { $nin: ["cart"] },
    });

    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const orderCount = orders.length;

    res.status(200).json({
      productCount,
      orderCount,
      totalRevenue,
      vendorStatus: req.vendor.status,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load dashboard.", error: err.message });
  }
};

// ─── GET /api/vendor/products ─────────────────────────────────────────────────
exports.getVendorProducts = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const products = await Product.find({ vendorId }).sort({ createdAt: -1 });
    res.status(200).json({ products });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products.", error: err.message });
  }
};

// ─── POST /api/vendor/products ────────────────────────────────────────────────
exports.addVendorProduct = async (req, res) => {
  try {
    const vendorId = req.user.vendorId; // always from JWT — never frontend

    const { name, category, size, brand, gender, desc, count, stockStatus, color, originalPrice, manufacturedBy, countryOfOrigin, consumerComplaints } = req.body;

    // Server-side price validation — never trust frontend price
    const price = parseFloat(req.body.price);
    if (isNaN(price) || price < 0) {
      return res.status(400).json({ message: "Invalid price. Price must be a non-negative number." });
    }

    if (!name || !category || !size || !brand || !gender) {
      return res.status(400).json({ message: "Name, category, size, brand, and gender are required." });
    }

    if (!req.files || !req.files['image'] || !req.files['image'][0]) {
      return res.status(400).json({ message: "Primary product image is required." });
    }

    const stockCount = parseInt(count) || 0;
    if (stockCount < 0) {
      return res.status(400).json({ message: "Stock count cannot be negative." });
    }

    const imagePath = `uploads/${req.files['image'][0].filename}`;
    
    let additionalImagePaths = [];
    if (req.files['additionalImages']) {
      additionalImagePaths = req.files['additionalImages'].map(file => `uploads/${file.filename}`);
    }

    const product = new Product({
      vendorId,
      name: name.trim(),
      category: category.trim(),
      size: size.trim(),
      brand: brand.trim(),
      gender: gender.trim(),
      color: color ? color.trim() : "Not Specified",
      price,
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      description: desc ? desc.trim() : "",
      manufacturedBy: manufacturedBy ? manufacturedBy.trim() : "",
      countryOfOrigin: countryOfOrigin ? countryOfOrigin.trim() : "India",
      consumerComplaints: consumerComplaints ? consumerComplaints.trim() : "",
      count: stockCount,
      image: imagePath,
      additionalImages: additionalImagePaths,
      stockStatus: stockStatus || (stockCount > 0 ? "In Stock" : "Out of Stock"),
      status: "active", // vendor products are immediately active
    });

    await product.save();

    res.status(201).json({
      message: "Product added successfully. It is now live on the store.",
      product,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to add product.", error: err.message });
  }
};

// ─── PUT /api/vendor/products/:id ─────────────────────────────────────────────
exports.updateVendorProduct = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const { id } = req.params;

    // Verify ownership before any update
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    if (product.vendorId?.toString() !== vendorId.toString()) {
      return res.status(403).json({ message: "Access denied. You do not own this product." });
    }

    const { name, category, size, brand, gender, desc, count, stockStatus, status, color, originalPrice, manufacturedBy, countryOfOrigin, consumerComplaints } = req.body;

    // Validate price if provided
    let price = product.price;
    if (req.body.price !== undefined) {
      price = parseFloat(req.body.price);
      if (isNaN(price) || price < 0) {
        return res.status(400).json({ message: "Invalid price." });
      }
    }

    // Validate count if provided
    let stockCount = product.count;
    if (count !== undefined) {
      stockCount = parseInt(count);
      if (isNaN(stockCount) || stockCount < 0) {
        return res.status(400).json({ message: "Stock count cannot be negative." });
      }
    }

    const updateData = {
      ...(name && { name: name.trim() }),
      ...(category && { category: category.trim() }),
      ...(size && { size: size.trim() }),
      ...(brand && { brand: brand.trim() }),
      ...(gender && { gender: gender.trim() }),
      ...(color && { color: color.trim() }),
      ...(originalPrice !== undefined && { originalPrice: parseFloat(originalPrice) || undefined }),
      ...(desc !== undefined && { description: desc.trim() }),
      ...(manufacturedBy !== undefined && { manufacturedBy: manufacturedBy.trim() }),
      ...(countryOfOrigin !== undefined && { countryOfOrigin: countryOfOrigin.trim() }),
      ...(consumerComplaints !== undefined && { consumerComplaints: consumerComplaints.trim() }),
      price,
      count: stockCount,
      ...(stockStatus && { stockStatus }),
      // Vendors can only toggle between active/inactive — not bypass admin disabling
      ...(status && ["active", "inactive"].includes(status) && { status }),
    };

    if (req.files && req.files['image'] && req.files['image'][0]) {
      updateData.image = `uploads/${req.files['image'][0].filename}`;
    }
    
    if (req.files && req.files['additionalImages']) {
      updateData.additionalImages = req.files['additionalImages'].map(file => `uploads/${file.filename}`);
    }

    const updated = await Product.findByIdAndUpdate(id, updateData, { new: true });

    res.status(200).json({ message: "Product updated successfully.", product: updated });
  } catch (err) {
    res.status(500).json({ message: "Failed to update product.", error: err.message });
  }
};

// ─── DELETE /api/vendor/products/:id ──────────────────────────────────────────
exports.deleteVendorProduct = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const { id } = req.params;

    // Verify ownership before deletion
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    if (product.vendorId?.toString() !== vendorId.toString()) {
      return res.status(403).json({ message: "Access denied. You do not own this product." });
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({ message: "Product deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product.", error: err.message });
  }
};

// ─── GET /api/vendor/orders ───────────────────────────────────────────────────
exports.getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;

    const orders = await Order.find({
      vendorId,
      status: { $nin: ["cart"] }, // exclude cart items
    })
      .populate("productId", "name image price brand category")
      .sort({ createdAt: -1 });

    // Return safe order data — limit customer info exposure
    const safeOrders = orders.map((o) => ({
      _id: o._id,
      product: o.productId,
      customerEmail: o.email,
      quantity: o.quantity,
      totalPrice: o.totalPrice,
      status: o.status,
      createdAt: o.createdAt,
      cancelReason: o.cancelReason,
      canceledAt: o.canceledAt,
    }));

    res.status(200).json({ orders: safeOrders });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders.", error: err.message });
  }
};

// ─── PUT /api/vendor/orders/:id/cancel ─────────────────────────────────────────
exports.cancelOrder = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim() === "") {
      return res.status(400).json({ message: "Cancellation reason is required." });
    }

    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (order.vendorId?.toString() !== vendorId.toString()) {
      return res.status(403).json({ message: "Access denied. You do not own this order." });
    }

    if (order.status === "canceled") {
      return res.status(400).json({ message: "Order is already canceled." });
    }

    // Check 24 hours logic
    const timeDiffMs = Date.now() - new Date(order.createdAt).getTime();
    const hoursDiff = timeDiffMs / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      return res.status(400).json({ message: "Orders cannot be canceled after 24 hours." });
    }

    order.status = "canceled";
    order.cancelReason = reason.trim();
    order.canceledAt = Date.now();
    
    await order.save();

    res.status(200).json({ message: "Order canceled successfully.", order });
  } catch (err) {
    res.status(500).json({ message: "Failed to cancel order.", error: err.message });
  }
};
