const Order = require("../models/Order");

const createOrder = async (req, res) => {
  try {
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
    res.status(201).json({ success: true, order: savedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createOrder };
