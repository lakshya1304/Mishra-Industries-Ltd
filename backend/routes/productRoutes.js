const express = require("express");
const productRouter = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Product = require("../models/Product");

// 1. Configure Local Disk Storage for temporary processing
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure the folder exists before saving
    const dir = "uploads/";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit to prevent timeout
});

// 2. CREATE: Add New Product (Updated for Base64 Sync)
productRouter.post("/add", upload.single("image"), async (req, res) => {
  try {
    let finalImageData = "/uploads/default.jpg";

    if (req.file) {
      // 1. Read the file from the temporary 'uploads' folder
      const bitmap = fs.readFileSync(req.file.path);
      // 2. Convert it to a Base64 string for database storage
      const base64String = Buffer.from(bitmap).toString("base64");
      finalImageData = `data:${req.file.mimetype};base64,${base64String}`;

      // 3. Delete the local file so Render doesn't run out of space
      fs.unlinkSync(req.file.path);
    }

    const productData = {
      ...req.body,
      image: finalImageData,
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

// 5. UPDATE: Edit Product (Base64 Sync)
productRouter.put("/edit/:id", upload.single("image"), async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.file) {
      // 1. Convert new image to Base64
      const bitmap = fs.readFileSync(req.file.path);
      const base64String = Buffer.from(bitmap).toString("base64");
      updateData.image = `data:${req.file.mimetype};base64,${base64String}`;

      // 2. Cleanup local file immediately
      fs.unlinkSync(req.file.path);
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

// 7. BACKUP: Export all products to a JSON file
productRouter.get("/backup/export", async (req, res) => {
  try {
    const products = await Product.find({});
    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=mishra_atlas_backup.json",
    );
    res.json({
      exportedAt: new Date(),
      totalProducts: products.length,
      data: products,
    });
  } catch (err) {
    res.status(500).json({ error: "Export failed: " + err.message });
  }
});

// 8. RESTORE: Import products from a JSON file
productRouter.post("/backup/import", async (req, res) => {
  try {
    const { data } = req.body;
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: "Invalid backup file format" });
    }

    const restoredProducts = await Product.insertMany(data);
    res.status(201).json({
      message: "Products restored successfully",
      count: restoredProducts.length,
    });
  } catch (err) {
    res.status(500).json({ error: "Import failed: " + err.message });
  }
});

// 9. DANGER: Delete All Products
productRouter.delete("/danger/delete-all", async (req, res) => {
  try {
    const result = await Product.deleteMany({});
    res.json({
      message: "All products have been deleted successfully",
      count: result.deletedCount,
    });
  } catch (err) {
    res.status(500).json({ error: "Wipe failed: " + err.message });
  }
});

module.exports = productRouter;
