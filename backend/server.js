const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

// 1. Load Environment Variables (Must be at the very top)
dotenv.config();

// 2. Initialize Express
const app = express();

// Debugging: This helps us see if the .env is actually working
console.log("-----------------------------------------");
console.log("Connecting to:", process.env.MONGO_URI);
console.log("-----------------------------------------");

// 3. Global Middleware
app.use(express.json()); // Allows server to accept JSON data from the frontend

// Enhanced CORS to prevent the "Not Showing" issue on your web page
app.use(cors({
    origin: "*", // Allows any frontend port to access the data
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// 4. Database Connection Logic
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Mishra Industries Database Connected Successfully'))
    .catch((err) => {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1); 
    });

// 5. API Routes Integration
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));

// 6. Root Route for Testing
app.get('/', (req, res) => {
    res.send('Mishra Industries API is running...');
});

// 7. Error Handling Middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

// 8. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});