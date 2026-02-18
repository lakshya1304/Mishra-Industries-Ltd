// backend/controllers/productController.js
const Product = require("../models/Product");

exports.getProductById = async (req, res) => {
    try {
        // Find the specific product added by the admin using its ID
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ message: "Product not found in Atlas" });
        }
        
        res.status(200).json(product);
    } catch (err) {
        res.status(400).json({ message: "Invalid ID format", error: err.message });
    }
};