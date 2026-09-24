const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    // userId for JWT-based future queries (nullable for backward compat)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },
    // vendorId — populated when product is vendor-owned
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      default: null,
    },
    name: { type: String },
    address: { type: String },
    phone: { type: String },
    quantity: { type: Number, default: 1 },
    totalPrice: { type: Number },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
    status: {
      type: String,
      enum: ["cart", "pending", "paid", "shipped", "delivered", "approved", "canceled", "refund"],
      default: "pending",
    },
    cancelReason: { type: String, default: null },
    canceledAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Indexes for vendor and user order queries
orderSchema.index({ email: 1 });
orderSchema.index({ vendorId: 1, status: 1 });
orderSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model("Order", orderSchema);
