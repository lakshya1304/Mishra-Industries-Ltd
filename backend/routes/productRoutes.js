const express = require("express");
const router = express.Router();

// Temporary test route for products
router.get("/test", (req, res) => {
  res.send("Product route is working");
});

module.exports = router; // THIS LINE IS THE MOST IMPORTANT
