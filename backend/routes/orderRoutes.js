const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
// CRITICAL FIX: Added the missing protect import
const { protect } = require("../middleware/authMiddleware");

/**
 * POST: Add new verified order to Atlas
 * Now supports paymentMethod and Confirmed status from payment.js
 */
router.post("/add", async (req, res) => {
  try {
    // Standardizing the order data with timestamps
    const newOrder = new Order({
      customerName: req.body.customerName,
      phone: req.body.phone,
      address: req.body.address,
      items: req.body.items,
      totalAmount: req.body.totalAmount,
      gstAmount: req.body.gstAmount,
      paymentMethod: req.body.paymentMethod || "Not Specified",
      status: req.body.status || "Pending",
    });

    await newOrder.save();
    res.status(201).json({ success: true, message: "Order saved to Atlas" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET: Fetch all orders for the Admin Dashboard
 * Uses createdAt descending so newest orders appear first in the Admin Table
 */
router.get("/all", async (req, res) => {
  try {
    // Changed orderDate to createdAt to match standard Mongoose timestamps
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT: Update Order Status (e.g., Pending to Shipped/Delivered)
 * Allows the Admin Dashboard to push orders through the fulfillment pipeline
 */
router.put("/status/:id", async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true },
    );

    if (!updatedOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET: Unified Analytics for System Console
router.get("/stats/total-sales", async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $count: {} },
        },
      },
    ]);

    // If no orders exist yet, return zeros instead of empty array
    const result =
      stats.length > 0 ? stats[0] : { totalRevenue: 0, totalOrders: 0 };

    res.json({
      success: true,
      totalRevenue: result.totalRevenue,
      totalOrders: result.totalOrders,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/orders/user-orders
router.get("/user-orders", protect, async (req, res) => {
  try {
    // Only finds orders matching req.user.id (from JWT)
    const orders = await Order.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Order Sync Failed" });
  }
});

module.exports = router;
