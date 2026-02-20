const express = require("express");
const productRouter = express.Router();
const multer = require("multer");
const path = require("path");
const Product = require("../models/Product");

// 1. Configure Local Disk Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// 2. CREATE: Add New Product
productRouter.post("/add", upload.single("image"), async (req, res) => {
  try {
    const productData = {
      ...req.body,
      // Saves a local path like "/uploads/123456789.jpg"
      image:
        req.file ? `/uploads/${req.file.filename}` : "/uploads/default.jpg",
    };
    const product = new Product(productData);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 3. READ: All Products
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

// 4. READ: Single Product
productRouter.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. UPDATE: Edit Product
productRouter.put("/edit/:id", upload.single("image"), async (req, res) => {
  try {
    const updateData = { ...req.body };
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

// 6. DELETE: Remove Product
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
