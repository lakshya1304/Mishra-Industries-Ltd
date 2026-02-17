const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// POST: Place a new order
router.post('/place', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).json({ message: "Order Placed Successfully!", orderId: newOrder._id });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;

// GET: Fetch all orders for the Admin Dashboard
router.get('/all', async (req, res) => {
    try {
        const orders = await Order.find().sort({ orderDate: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT: Update Order Status (e.g., Pending to Shipped)
router.put('/status/:id', async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id, 
            { status: req.body.status }, 
            { new: true }
        );
        res.json(updatedOrder);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});