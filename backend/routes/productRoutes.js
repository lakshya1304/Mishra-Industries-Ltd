const express = require("express");
const productRouter = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const Product = require("../models/Product");

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Set up Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "mishra_products", // Folder name in your Cloudinary dashboard
    upload_preset: "mishra_preset", // Link to your Cloudinary Upload Preset
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const upload = multer({ storage: storage });

// 3. CREATE: Add New Product
productRouter.post("/add", upload.single("image"), async (req, res) => {
  try {
    const productData = {
      ...req.body,
      // Cloudinary returns the full URL in req.file.path
      image: req.file ? req.file.path : "/uploads/default.jpg",
    };
    const product = new Product(productData);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 4. READ: All Products
productRouter.get("/all", async (req, res) => {
  try {
    const { category, company } = req.query;
    let filter = {};
    if (category) filter.category = category;
    if (company) filter.company = company;

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. READ: Single Product
productRouter.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. UPDATE: Edit Product
productRouter.put("/edit/:id", upload.single("image"), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = req.file.path; // New Cloudinary URL
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );

    if (!updatedProduct)
      return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product updated successfully!", updatedProduct });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 7. DELETE: Remove Product
productRouter.delete("/delete/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct)
      return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product Deleted Successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = productRouter;
