const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { protect } = require("../middleware/authMiddleware");

// ===============================
// ✅ POST: Add New Order
// ===============================
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

    const savedOrder = await newOrder.save();

    res.status(201).json({
      success: true,
      message: "Order saved to Atlas",
      order: savedOrder,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===============================
// ✅ ADMIN: Fetch All Orders
// ===============================
router.get("/all", protect, async (req, res) => {
  try {
    // FIX: This check triggers the 403 error if your Atlas record says "customer"
    if (req.user.accountType !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied: Account type is not admin" });
    }

    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// ✅ USER: Fetch Own Orders
// ===============================
router.get("/my-orders", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Order Sync Failed" });
  }
});

// ===============================
// ✅ ADMIN: Update Order Status
// ===============================
router.put("/status/:id", protect, async (req, res) => {
  try {
    if (req.user.accountType !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true },
    );

    if (!updatedOrder)
      return res.status(404).json({ message: "Order not found" });

    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ===============================
// ✅ ADMIN: Analytics
// ===============================
router.get("/stats/total-sales", protect, async (req, res) => {
  try {
    if (req.user.accountType !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

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

    res.status(200).json({
      success: true,
      totalRevenue: result.totalRevenue,
      totalOrders: result.totalOrders,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// ✅ ADMIN: Delete Order
// ===============================
router.delete("/delete/:id", protect, async (req, res) => {
  try {
    if (req.user.accountType !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const deletedOrder = await Order.findByIdAndDelete(req.params.id);

    if (!deletedOrder)
      return res.status(404).json({ message: "Order not found" });

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
