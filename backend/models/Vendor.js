const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    ownerName: { type: String, required: true, trim: true },
    businessName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    businessDescription: { type: String, default: "" },
    passwordHash: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
    approvedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: "" },
  },
  { timestamps: true }
);

// Index for faster queries
vendorSchema.index({ email: 1 });
vendorSchema.index({ status: 1 });

module.exports = mongoose.model("Vendor", vendorSchema, "vendors");
