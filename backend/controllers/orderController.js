import Order from "../models/Order.js";
import asyncHandler from "../utils/asyncHandler.js";
import err from "../utils/err.js";
import success from "../utils/success.js";

export const createOrder = asyncHandler(async (req, res) => {
  const {
    customerName,
    phone,
    address,
    items,
    totalAmount,
    paymentMethod,
    transactionId,
  } = req.body;

  const newOrder = new Order({
    user: req.user._id,
    customerName,
    phone,
    address,
    items,
    totalAmount,
    paymentMethod,
    transactionId,
    status: paymentMethod === "COD" ? "Pending" : "Paid",
  });

  const savedOrder = await newOrder.save();
  if (!savedOrder) return err(res, "Order creation failed", 500);
  return success(res, "Order created", 201, { order: savedOrder });
});

export default createOrder;
