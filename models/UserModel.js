const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "User name is required"],
      minLength: [3, "must be more than 3"],
      maxLength: [32, "must be less than 32"]
    },
    slug: {
      type: String,
      lowercase: true
    },
    email: {
      type: String,
      required: [true, "User name is required"],
      minLength: [3, "must be more than 3"],
      maxLength: [32, "must be less than 32"],
      unique: true
    },
    password: {
      type: String,
      required: [true, "User password is required"],
      minLength: [6, "must be more than 3"]
    },
    passwordChangedAt: Date,
    passwordReset: String,
    passwordResetExpires: Date,
    isVerified: Boolean,
    phone: String,
    avatar: String,
    role: {
      type: String,
      enum: ["admin", "user"], // Dont Accept any option other than admin or user
      default: "user"
    },
    active: {
      type: Boolean,
      default: true
    },
    // child reference to the product model (one to many relationship)
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      }
    ],
    address: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId
        },
        alias: String,
        details: String,
        phone: String,
        city: String,
        postalCode: String
      }
    ]
  },
  { timestamps: true }
);

// hash the password before saving it to the database for creation only
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const userModel = mongoose.model("User", userSchema);
module.exports = userModel;
