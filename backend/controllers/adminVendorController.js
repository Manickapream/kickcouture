const Vendor = require("../models/Vendor");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");

// ─── GET /api/admin/vendors ───────────────────────────────────────────────────
exports.getAllVendors = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const vendors = await Vendor.find(filter)
      .select("-passwordHash -password")
      .sort({ createdAt: -1 });

    // Enrich with product count
    const enriched = await Promise.all(
      vendors.map(async (v) => {
        const productCount = await Product.countDocuments({ vendorId: v._id });
        return { ...v.toObject(), productCount };
      })
    );

    res.status(200).json({ vendors: enriched });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch vendors.", error: err.message });
  }
};

// ─── GET /api/admin/vendors/:id ───────────────────────────────────────────────
exports.getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).select("-passwordHash -password");
    if (!vendor) return res.status(404).json({ message: "Vendor not found." });

    const products = await Product.find({ vendorId: vendor._id }).sort({ createdAt: -1 });
    const orders = await Order.find({ vendorId: vendor._id, status: { $ne: "cart" } })
      .populate("productId", "name price")
      .sort({ createdAt: -1 })
      .limit(50);

    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    res.status(200).json({
      vendor,
      products,
      orders,
      stats: {
        productCount: products.length,
        orderCount: orders.length,
        totalRevenue,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch vendor details.", error: err.message });
  }
};

// ─── PATCH /api/admin/vendors/:id/approve ────────────────────────────────────
exports.approveVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found." });

    if (vendor.status === "approved") {
      return res.status(400).json({ message: "Vendor is already approved." });
    }

    vendor.status = "approved";
    vendor.approvedBy = req.user.id;
    vendor.approvedAt = new Date();
    vendor.rejectionReason = "";
    await vendor.save();

    console.log(`[AUDIT] Admin ${req.user.id} approved vendor ${vendor._id} (${vendor.businessName})`);

    res.status(200).json({
      message: `Vendor "${vendor.businessName}" has been approved.`,
      vendor: { ...vendor.toObject(), passwordHash: undefined },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to approve vendor.", error: err.message });
  }
};

// ─── PATCH /api/admin/vendors/:id/reject ─────────────────────────────────────
exports.rejectVendor = async (req, res) => {
  try {
    const { reason } = req.body;
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found." });

    if (vendor.status === "rejected") {
      return res.status(400).json({ message: "Vendor application is already rejected." });
    }

    vendor.status = "rejected";
    vendor.rejectionReason = reason || "Application did not meet requirements.";
    await vendor.save();

    console.log(`[AUDIT] Admin ${req.user.id} rejected vendor ${vendor._id} (${vendor.businessName}). Reason: ${vendor.rejectionReason}`);

    res.status(200).json({
      message: `Vendor "${vendor.businessName}" has been rejected.`,
      vendor: { ...vendor.toObject(), passwordHash: undefined },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to reject vendor.", error: err.message });
  }
};

// ─── PATCH /api/admin/vendors/:id/suspend ────────────────────────────────────
exports.suspendVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found." });

    if (vendor.status === "suspended") {
      return res.status(400).json({ message: "Vendor is already suspended." });
    }

    vendor.status = "suspended";
    await vendor.save();

    // Deactivate all vendor products
    await Product.updateMany({ vendorId: vendor._id }, { status: "inactive" });

    console.log(`[AUDIT] Admin ${req.user.id} suspended vendor ${vendor._id} (${vendor.businessName})`);

    res.status(200).json({
      message: `Vendor "${vendor.businessName}" has been suspended. Their products have been deactivated.`,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to suspend vendor.", error: err.message });
  }
};

// ─── PATCH /api/admin/vendors/:id/reactivate ─────────────────────────────────
exports.reactivateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found." });

    if (vendor.status === "approved") {
      return res.status(400).json({ message: "Vendor is already active." });
    }

    vendor.status = "approved";
    vendor.approvedBy = req.user.id;
    vendor.approvedAt = new Date();
    await vendor.save();

    // Reactivate vendor products
    await Product.updateMany({ vendorId: vendor._id }, { status: "active" });

    console.log(`[AUDIT] Admin ${req.user.id} reactivated vendor ${vendor._id} (${vendor.businessName})`);

    res.status(200).json({
      message: `Vendor "${vendor.businessName}" has been reactivated. Their products are live again.`,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to reactivate vendor.", error: err.message });
  }
};

// ─── GET /api/admin/reports ───────────────────────────────────────────────────
exports.getReports = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVendors = await Vendor.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments({ status: { $ne: "cart" } });

    const pendingVendors = await Vendor.countDocuments({ status: "pending" });
    const approvedVendors = await Vendor.countDocuments({ status: "approved" });

    const orders = await Order.find({ status: { $ne: "cart" } });
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    // Vendor-wise sales
    const vendorSales = await Order.aggregate([
      { $match: { status: { $ne: "cart" }, vendorId: { $ne: null } } },
      {
        $group: {
          _id: "$vendorId",
          totalSales: { $sum: "$totalPrice" },
          orderCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "vendors",
          localField: "_id",
          foreignField: "_id",
          as: "vendor",
        },
      },
      { $unwind: { path: "$vendor", preserveNullAndEmpty: true } },
      {
        $project: {
          businessName: "$vendor.businessName",
          totalSales: 1,
          orderCount: 1,
        },
      },
    ]);

    res.status(200).json({
      totalUsers,
      totalVendors,
      pendingVendors,
      approvedVendors,
      totalProducts,
      totalOrders,
      totalRevenue,
      vendorSales,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate report.", error: err.message });
  }
};
