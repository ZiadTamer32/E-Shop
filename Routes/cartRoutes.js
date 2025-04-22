const express = require("express");

const router = express.Router();

const {
  addProductToCart,
  getProductsInCart,
  removeProductFromCart,
  clearCart,
  updateCartItemQuantity,
  applyCoupon
} = require("../services/cartService");

//Authentication
const { protect, allowedTo } = require("../services/authService");

router.use(protect, allowedTo("user"));

router
  .route("/")
  .post(addProductToCart)
  .get(getProductsInCart)
  .delete(clearCart);

router.route("/applyCoupon").post(applyCoupon);

router
  .route("/:itemId")
  .delete(removeProductFromCart)
  .put(updateCartItemQuantity);

module.exports = router;
