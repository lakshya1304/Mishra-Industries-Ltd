import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      default: "",
    },
    userName: {
      type: String,
      trim: true,
      required: [true, "Please add username"],
    },
    otp: {
      type: String,
      default: null,
    },
    otpExp: {
      type: Date,
      default: null,
    },
    emailVerified: {
      type: Boolean,
      default: false,
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
      // Adjusted regex to allow flexible international lengths
      match: [/^[0-9]{7,15}$/, "Please add a valid phone number"],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
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
      // Added 'admin' to the allowed list to fix access denied issues
      enum: ["customer", "retailer", "admin"],
      default: "customer",
    },
    businessName: {
      type: String,
      required: function () {
        return this.accountType === "retailer";
      },
    },
    gstNumber: {
      type: String,
      uppercase: true,
      trim: true,
    },
    address: String,
    pincode: String,
    locality: String,
    city: String,
    profilePic: String,
    gstFile: String,
    panFile: String,
    msmeFile: String,
    resetPasswordOTP: String,
    resetPasswordExpire: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timeseries: true },
);

// Hash password before saving
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

export default mongoose.model("User", userSchema);
