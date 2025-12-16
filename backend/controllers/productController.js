const ProductModel = require("../models/Product");

// ADD PRODUCT
exports.addProduct = async (req, res) => {
  const { name, category, size, brand, gender, price, desc, stockStatus, count } = req.body;
  const imagePath = req.file ? `uploads/${req.file.filename}` : null;

  try {
    const newProduct = new ProductModel({
      name,
      category,
      size,
      brand,
      gender,
      price,
      description: desc,
      count: count || 0,
      image: imagePath,
      stockStatus: stockStatus || "In Stock",
    });

    await newProduct.save();
    res.status(201).json({ message: "✅ Product added successfully", data: newProduct });
  } catch (error) {
    console.error("❌ Error adding product:", error);
    res.status(500).json({ message: "Error adding product", error: error.message });
  }
};

// GET ALL PRODUCTS
exports.getProducts = async (req, res) => {
  try {
    const products = await ProductModel.find();
    res.status(200).json({ message: "✅ Products fetched successfully", data: products });
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
};

// DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await ProductModel.findByIdAndDelete(id);
    res.status(200).json({ message: "🗑️ Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
};

// UPDATE PRODUCT
exports.updateProduct = async (req, res) => {
  try {
    const updateData = req.body;
    if (req.file) updateData.image = `uploads/${req.file.filename}`;

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "❌ Product not found" });
    }

    res.status(200).json({ message: "✅ Product updated successfully", data: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error: error.message });
  }
};
