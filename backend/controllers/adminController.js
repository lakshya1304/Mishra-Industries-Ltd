const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  // Fixed credentials as requested
  if (email === "admin@mishra.com" && password === "Mishra@716") {
    // Find or Create the admin record in DB to get an ID for JWT
    let admin = await Admin.findOne({ email });
    if (!admin) {
      admin = await Admin.create({ email, password, name: "Super Admin" });
    }

    res.json({
      _id: admin._id,
      email: admin.email,
      accountType: "admin", // Crucial for frontend logic
      isAdmin: true,
      token: generateToken(admin._id),
    });
  } else {
    res.status(401).json({ message: "Invalid Admin Credentials" });
  }
};

module.exports = { loginAdmin };
