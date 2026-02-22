const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    // Link to User model
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    items: [
      {
        name: String,
        price: Number,
        quantity: { type: Number, default: 1 },
        image: String,
      },
    ],
    totalAmount: { type: Number, required: true },
    gstAmount: { type: Number, default: 0 },
    paymentMethod: { type: String, required: true },
    transactionId: { type: String, default: "N/A" },
    status: { type: String, default: "Pending" }, // Pending, Paid, Shipped, Delivered
  },
  { timestamps: true },
); // Added timestamps for createdAt/updatedAt

module.exports = mongoose.model("Order", orderSchema);
