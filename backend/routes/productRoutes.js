const express = require("express");
const productRouter = express.Router();
const multer = require("multer");
const path = require("path");
const Product = require("../models/Product"); // Ensure this matches your filename
const {
  getProducts,
  getProductById,
} = require("../controllers/productController");

// 1. Configure Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage: storage });

// 2. CREATE: Add New Product
productRouter.post("/add", upload.single("image"), async (req, res) => {
  console.log("api posted");
  try {
    const productData = {
      ...req.body, // This will now automatically include 'company' from your form
      image:
        req.file ? `/uploads/${req.file.filename}` : "/uploads/default.jpg",
    };
    console.table(productData);
    const product = new Product(productData);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 3. READ: Get all products (Updated with Company Filter for Shop)
productRouter.get("/all", async (req, res) => {
  try {
    const { category, company } = req.query; // Capture company from URL query
    let filter = {};

    if (category) filter.category = category;
    if (company) filter.company = company; // Apply brand/company filter if provided

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. READ: Get Single Product (Required for Edit & Details page)
productRouter.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. UPDATE: Edit product details
productRouter.put("/edit/:id", upload.single("image"), async (req, res) => {
  try {
    const updateData = { ...req.body }; // Automatically captures updated 'company'

    // If a new image was uploaded, update the path
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
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

// 6. DELETE: Remove product
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
