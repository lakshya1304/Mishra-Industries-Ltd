import express from "express";
import Order from "../models/Order.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// @route   POST /api/orders/add
router.post("/add", protect, async (req, res) => {
  try {
    const newOrder = new Order({
      user: req.user._id, // Use req.user from middleware
      customerName: req.body.customerName,
      phone: req.body.phone,
      address: req.body.address,
      items: req.body.items,
      totalAmount: req.body.totalAmount,
      gstAmount: req.body.gstAmount || 0,
      paymentMethod: req.body.paymentMethod || "Online",
      transactionId: req.body.transactionId || "N/A",
      status: req.body.status || "Pending",
    });

    await newOrder.save();
    res.status(201).json({ success: true, message: "Order saved to Atlas" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/orders/all (ADMIN ONLY)
router.get("/all", protect, async (req, res) => {
  try {
    // Check if the user is an admin
    if (req.user.accountType !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Server Error: Could not fetch orders" });
  }
});

// @route   GET /api/orders/my-orders (USER ONLY)
router.get("/my-orders", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Order Sync Failed" });
  }
});

// @route   DELETE /api/orders/delete/:id
router.delete("/delete/:id", protect, async (req, res) => {
  try {
    if (req.user.accountType !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order removed from Atlas" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
