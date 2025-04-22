const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, "Please provide a coupon name"],
      trim: true
    },
    discount: {
      type: Number,
      required: [true, "Please provide a discount amount"],
      min: [0, "Discount cannot be less than 0"]
    },
    expired: {
      type: Date,
      required: [true, "Please provide an expiration date"]
    }
  },
  { timestamps: true }
);

const couponModel = mongoose.model("Coupon", couponSchema);

module.exports = couponModel;
