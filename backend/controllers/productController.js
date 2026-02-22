const Product = require("../models/Product");

// Add Product
exports.addProduct = async (req, res) => {
  try {
    const { name, price, category, company, stock, discount, description } =
      req.body;

    // Get the path from Multer
    const imagePath =
      req.file ? `/uploads/${req.file.filename}` : "/images/logo.jpeg";

    const product = await Product.create({
      name,
      price,
      category,
      company,
      stock,
      discount,
      description,
      image: imagePath, // Saving the URL path to DB
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Edit Product
exports.editProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Update text fields
    Object.assign(product, req.body);

    // Update image if new one is uploaded
    if (req.file) {
      product.image = `/uploads/${req.file.filename}`;
    }

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ... keep your other functions (getProducts, deleteProduct) as they are
