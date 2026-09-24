const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    // Vendor reference — null for admin-added products (backward compatible)
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      default: null,
    },
    name: { type: String, required: true },
    category: { type: String, required: true },
    size: { type: String, required: true },
    brand: { type: String, required: true },
    gender: { type: String, required: true },
    color: { type: String, required: true, default: "Not Specified" },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    description: { type: String, required: true },
    manufacturedBy: { type: String },
    countryOfOrigin: { type: String, default: "India" },
    consumerComplaints: { type: String },
    image: { type: String, required: true },
    additionalImages: [{ type: String }],
    count: { type: Number, required: true, default: 0, min: 0 },
    stockStatus: {
      type: String,
      enum: ["In Stock", "Out of Stock"],
      default: "In Stock",
    },
    // Product visibility — active products show in catalog
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    reviews: [
      {
        userEmail: { type: String, required: true },
        name: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      }
    ],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

// Index for catalog queries
productSchema.index({ status: 1 });
productSchema.index({ vendorId: 1 });

module.exports = mongoose.model("product", productSchema, "product");
