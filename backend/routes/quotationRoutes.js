import express from "express";
import mongoose from "mongoose";

const router = express.Router();

// Schema for Bulk Quotations
const quotationSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  gstNumber: { type: String },
  category: { type: String },
  quantity: { type: Number },
  unit: { type: String },
  requirements: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Quotation = mongoose.model("Quotation", quotationSchema);

// POST /api/quotations/add
router.post("/add", async (req, res) => {
  try {
    const newQuo = await Quotation.create(req.body);
    res.status(201).json(newQuo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/quotations/all
router.get("/all", async (req, res) => {
  try {
    const data = await Quotation.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/quotations/delete/:id
router.delete("/delete/:id", async (req, res) => {
  try {
    await Quotation.findByIdAndDelete(req.params.id);
    res.json({ message: "Quotation deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
