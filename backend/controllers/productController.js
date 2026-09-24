const ProductModel = require("../models/Product");

// ADD PRODUCT (Admin only — protected by route middleware)
exports.addProduct = async (req, res) => {
  const { name, category, size, brand, gender, price, desc, stockStatus, count, color, originalPrice, manufacturedBy, countryOfOrigin, consumerComplaints, vendorId } = req.body;
  const imagePath = (req.files && req.files['image'] && req.files['image'][0]) ? `uploads/${req.files['image'][0].filename}` : null;
  
  let additionalImagePaths = [];
  if (req.files && req.files['additionalImages']) {
    additionalImagePaths = req.files['additionalImages'].map(file => `uploads/${file.filename}`);
  }

  if (!imagePath) {
    return res.status(400).json({ message: "Product image is required." });
  }

  // Server-side price validation
  const parsedPrice = parseFloat(price);
  if (isNaN(parsedPrice) || parsedPrice < 0) {
    return res.status(400).json({ message: "Invalid price." });
  }

  const parsedCount = parseInt(count) || 0;

  try {
    const newProduct = new ProductModel({
      name,
      category,
      size,
      brand,
      gender,
      color: color ? color.trim() : "Not Specified",
      price: parsedPrice,
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      description: desc,
      manufacturedBy: manufacturedBy ? manufacturedBy.trim() : "",
      countryOfOrigin: countryOfOrigin ? countryOfOrigin.trim() : "India",
      consumerComplaints: consumerComplaints ? consumerComplaints.trim() : "",
      count: parsedCount,
      image: imagePath,
      additionalImages: additionalImagePaths,
      stockStatus: stockStatus || "In Stock",
      status: "active", // admin products always active
      vendorId: vendorId || null,
    });

    await newProduct.save();
    res.status(201).json({ message: "✅ Product added successfully", data: newProduct });
  } catch (error) {
    console.error("❌ Error adding product:", error);
    res.status(500).json({ message: "Error adding product", error: error.message });
  }
};

// GET ALL ACTIVE PRODUCTS (Public — customer catalog)
exports.getProducts = async (req, res) => {
  try {
    // Only return active products to customers
    const products = await ProductModel.find({ status: "active" }).sort({ createdAt: -1 });
    res.status(200).json({ message: "✅ Products fetched successfully", data: products });
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
};

// GET ALL PRODUCTS including inactive (Admin only — use /api/admin/products)
exports.getAllProductsAdmin = async (req, res) => {
  try {
    const products = await ProductModel.find()
      .populate("vendorId", "businessName ownerName email")
      .sort({ createdAt: -1 });
    res.status(200).json({ message: "✅ Products fetched successfully", data: products });
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
};

// DELETE PRODUCT (Admin only)
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await ProductModel.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Product not found." });
    res.status(200).json({ message: "🗑️ Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
};

// UPDATE PRODUCT (Admin only)
exports.updateProduct = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.files && req.files['image'] && req.files['image'][0]) {
      updateData.image = `uploads/${req.files['image'][0].filename}`;
    }
    
    if (req.files && req.files['additionalImages']) {
      updateData.additionalImages = req.files['additionalImages'].map(file => `uploads/${file.filename}`);
    }

    // Validate price if provided
    if (updateData.price !== undefined) {
      const p = parseFloat(updateData.price);
      if (isNaN(p) || p < 0) {
        return res.status(400).json({ message: "Invalid price." });
      }
      updateData.price = p;
    }

    // Handle vendorId assignment (empty string becomes null)
    if (updateData.vendorId === "") {
      updateData.vendorId = null;
    }

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

// ─── ADD PRODUCT REVIEW (User only) ──────────────────────────────────────────
exports.addProductReview = async (req, res) => {
  try {
    const { rating, comment, name, userEmail } = req.body;
    
    // We expect userEmail from the body since we don't have user object attached to req yet,
    // or we can use req.user.email if verifyToken attaches it.
    // For now, let's trust the body or use req.user.email if available.
    const reviewerEmail = req.user?.email || userEmail;

    if (!reviewerEmail) {
      return res.status(401).json({ message: "User email not found. Please log in." });
    }

    if (!rating || !comment || !name) {
      return res.status(400).json({ message: "Rating, comment, and name are required." });
    }

    const product = await ProductModel.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const alreadyReviewed = product.reviews.find(
      (r) => r.userEmail === reviewerEmail
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: "You have already reviewed this product." });
    }

    const review = {
      name: name,
      userEmail: reviewerEmail,
      rating: Number(rating),
      comment: comment,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: "Review added successfully", data: product });
  } catch (error) {
    res.status(500).json({ message: "Failed to add review", error: error.message });
  }
};

// ─── UPDATE PRODUCT REVIEW (User only) ───────────────────────────────────────
exports.updateProductReview = async (req, res) => {
  try {
    const { rating, comment, userEmail } = req.body;
    const reviewerEmail = req.user?.email || userEmail;

    if (!reviewerEmail) return res.status(401).json({ message: "Please log in." });
    if (!rating || !comment) return res.status(400).json({ message: "Rating and comment required." });

    const product = await ProductModel.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found." });

    const reviewIndex = product.reviews.findIndex(r => r.userEmail === reviewerEmail);
    if (reviewIndex === -1) {
      return res.status(404).json({ message: "Review not found." });
    }

    product.reviews[reviewIndex].rating = Number(rating);
    product.reviews[reviewIndex].comment = comment;
    product.reviews[reviewIndex].createdAt = Date.now(); // update timestamp

    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(200).json({ message: "Review updated successfully", data: product });
  } catch (error) {
    res.status(500).json({ message: "Failed to update review", error: error.message });
  }
};

// ─── DELETE PRODUCT REVIEW (User only) ───────────────────────────────────────
exports.deleteProductReview = async (req, res) => {
  try {
    // Some frontends send body with DELETE, others send it via query.
    // Let's check body or req.user.email
    const userEmail = req.body.userEmail || req.query.userEmail;
    const reviewerEmail = req.user?.email || userEmail;

    if (!reviewerEmail) return res.status(401).json({ message: "Please log in." });

    const product = await ProductModel.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found." });

    const initialLength = product.reviews.length;
    product.reviews = product.reviews.filter(r => r.userEmail !== reviewerEmail);

    if (product.reviews.length === initialLength) {
      return res.status(404).json({ message: "Review not found." });
    }

    product.numReviews = product.reviews.length;
    if (product.numReviews > 0) {
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;
    } else {
      product.rating = 0;
    }

    await product.save();
    res.status(200).json({ message: "Review deleted successfully", data: product });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete review", error: error.message });
  }
};
