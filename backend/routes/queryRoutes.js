const express = require("express");
const router = express.Router();
const Query = require("../models/Query");
const sendEmail = require("../utils/sendEmail"); // Assuming your email util exists

// @route   POST /api/queries/add
router.post("/add", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // 1. Save to MongoDB Atlas
    const newQuery = await Query.create({ name, email, message });

    // 2. Send Notification Email to Admin
    try {
      await sendEmail({
        email: "mishraindustriesltd@gmail.com", // Your admin email
        subject: `New Client Query: ${name}`,
        message: `You received a new message from ${name} (${email}):\n\n"${message}"`,
        type: "notification",
      });
    } catch (mailErr) {
      console.error("Email notification failed:", mailErr);
    }

    res.status(201).json(newQuery);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/queries/all
router.get("/all", async (req, res) => {
  try {
    const queries = await Query.find().sort({ createdAt: -1 });
    res.json(queries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   DELETE /api/queries/delete/:id
router.delete("/delete/:id", async (req, res) => {
  try {
    await Query.findByIdAndDelete(req.params.id);
    res.json({ message: "Query removed from Atlas" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
