const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    name: { type: String },
    address: { type: String },
    phone: { type: String },
    quantity: { type: Number, default: 1 },
    totalPrice: { type: Number },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product", // must match your product model name
      required: true,
    },
    status: {
      type: String,
      enum: ["cart", "pending", "paid", "shipped", "delivered", "approved", "canceled", "refund"],
      default: "pending",
    },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
  }
);

// export the model
module.exports = mongoose.model("Order", orderSchema);
