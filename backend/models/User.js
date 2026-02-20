const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Please add a full name"],
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  phone: {
    type: String,
    required: [true, "Please add a phone number"],
    unique: true,
    match: [/^[6-9]\d{9}$/, "Please add a valid 10-digit Indian phone number"],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    // Strict Validation: 1 Upper, 1 Lower, 1 Num, 1 Special, Min 8
    validate: {
      validator: function (v) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
          v,
        );
      },
      message:
        "Password must be at least 8 digits and include 1 uppercase, 1 lowercase, 1 number, and 1 special character.",
    },
    select: false,
  },
  accountType: {
    type: String,
    enum: ["customer", "retailer"],
    default: "customer",
  },
  businessName: {
    type: String,
    required: function () {
      return this.accountType === "retailer";
    },
  },
  resetPasswordOTP: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ENCRYPTION: Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
