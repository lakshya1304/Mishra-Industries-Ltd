const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    items: [{
        name: String,
        price: Number,
        quantity: { type: Number, default: 1 }
    }],
    totalAmount: { type: Number, required: true },
    status: { type: String, default: 'Pending' }, // Pending, Shipped, Delivered
    orderDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);