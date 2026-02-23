import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    company: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    // String is correct for both file paths and Base64 data
    image: { type: String, required: true },
  },
  { timestamps: true },
);

const Product = mongoose.model("Product", productSchema);
export default Product;
