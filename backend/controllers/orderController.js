const createOrder = async (req, res) => {
  try {
    res.status(201).json({ message: "Order created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder };