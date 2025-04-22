const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    cartItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          default: 1
        },
        price: {
          type: Number,
          required: true
        },
        color: String
      }
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0
    },
    totalPriceAfterDiscount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

const CartModel = mongoose.model("Cart", cartSchema);

module.exports = CartModel;
