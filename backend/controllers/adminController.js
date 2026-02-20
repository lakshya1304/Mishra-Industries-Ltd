const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'mishraback_secret', { expiresIn: '30d' });
};

const loginAdmin = async (req, res) => {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    // For now, we compare plain text. (Use bcrypt for production later)
    if (admin && admin.password === password) {
        res.json({
            _id: admin._id,
            email: admin.email,
            isAdmin: true,
            token: generateToken(admin._id)
        });
    } else {
        res.status(401).json({ message: 'Invalid Admin Credentials' });
    }
};

module.exports = { loginAdmin };