const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { protect } = require("../middleware/authMiddleware");

// POST: Add new verified order to Atlas
router.post("/add", protect, async (req, res) => {
  try {
    const newOrder = new Order({
      user: req.user._id,
      customerName: req.body.customerName,
      phone: req.body.phone,
      address: req.body.address,
      items: req.body.items,
      totalAmount: req.body.totalAmount,
      gstAmount: req.body.gstAmount || 0,
      paymentMethod: req.body.paymentMethod || "Not Specified",
      transactionId: req.body.transactionId || "N/A",
      status: req.body.status || "Pending",
    });

    await newOrder.save();
    res.status(201).json({ success: true, message: "Order saved to Atlas" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET: Fetch all orders for the Admin Dashboard
router.get("/all", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT: Update Order Status
router.put("/status/:id", async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true },
    );

    if (!updatedOrder)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET: Unified Analytics
router.get("/stats/total-sales", async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);
    const result =
      stats.length > 0 ? stats[0] : { totalRevenue: 0, totalOrders: 0 };
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET: Fetch current user's orders
router.get("/user-orders", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Order Sync Failed" });
  }
});

module.exports = router;
