const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    size: { type: String, required: true },
    brand: { type: String, required: true },
    gender: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    count: { type: Number, required: true, default: 0 },
    stockStatus: {
      type: String,
      enum: ["In Stock", "Out of Stock"],
      default: "In Stock",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("product", productSchema, "product");
