const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const PORT = 5000;



// Route imports
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const adminRoutes = require("./routes/adminRoutes");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/UserRoute");
const orderRoutes = require("./routes/orderRoutes");
const uploadsDir = require("path").join(__dirname, "uploads", "images");



// Route Definitions
app.use("/api/admin", adminRoutes);
app.use("/api/product", productRoutes);
app.use("/api/user", userRoutes);
app.use("/api/order", orderRoutes);
app.use("/uploads/images", express.static(uploadsDir));

// mongoose.connect("mongodb://127.0.0.1:27017/kickcouture")
mongoose.connect("mongodb+srv://manipirama:mani@cluster0.svr0w6i.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.error("MongoDB connection error:", err));

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
