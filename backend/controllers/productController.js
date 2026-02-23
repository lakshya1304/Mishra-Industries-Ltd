import Product from "../models/Product.js";
import asyncHandler from "../utils/asyncHandler.js";
import err from "../utils/err.js";
import success from "../utils/success.js";

export const addProduct = asyncHandler(async (req, res) => {
  const { name, price, category, company, stock, discount, description } =
    req.body;
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
    image: imagePath,
  });
  if (!product) return err(res, "Product creation failed", 500);
  return success(res, "Product created", 201, product);
});

export const editProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return err(res, "Product not found", 404);
  Object.assign(product, req.body);
  if (req.file) {
    product.image = `/uploads/${req.file.filename}`;
  }
  await product.save();
  return success(res, "Product updated", 200, product);
});

// ... keep your other functions (getProducts, deleteProduct) as they are

export default {
  addProduct,
  editProduct,
  // ...add other methods here as you convert them
};
