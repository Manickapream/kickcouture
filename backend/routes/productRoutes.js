const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const productController = require("../controllers/productController");

// Multer storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Routes
router.post("/add", upload.single("image"), productController.addProduct);
router.get("/get", productController.getProducts);
router.delete("/:id", productController.deleteProduct);
router.put("/:id", upload.single("image"), productController.updateProduct);

module.exports = router;
