const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/ApiErrors");
const CartModel = require("../models/cartModel");
const ProductModel = require("../models/productModel");
const CouponModel = require("../models/couponModel");

const calculateTotalPrice = (cart) => {
  // Recalculate total price
  const totalPrice = cart.cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  cart.totalPrice = totalPrice;
  return cart;
};

exports.addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId, color } = req.body;

  const product = await ProductModel.findById(productId);

  if (!product) {
    return next(new ApiError("Product not found", 404));
  }

  let cart = await CartModel.findOne({ user: req.user._id });

  if (!cart) {
    cart = await CartModel.create({
      user: req.user._id,
      cartItems: [
        {
          product: productId,
          color,
          price: product.price
        }
      ],
      totalPrice: product.price,
      totalPriceAfterDiscount: 0
    });
  } else {
    const productInCart = cart.cartItems.find(
      (item) => item.product.toString() === productId && item.color === color
    );

    if (productInCart) {
      productInCart.quantity += 1;
    } else {
      cart.cartItems.push({
        product: productId,
        color,
        price: product.price
      });
    }
    // Calculate total price
    calculateTotalPrice(cart);
    cart.totalPriceAfterDiscount = 0;

    // Save the cart and product
    await cart.save();
  }

  res.status(200).json({
    status: "success",
    message: "Product added to cart successfully",
    numItems: cart.cartItems.length,
    cart
  });
});

exports.getProductsInCart = asyncHandler(async (req, res, next) => {
  const cart = await CartModel.findOne({ user: req.user._id });

  if (!cart) {
    return next(new ApiError("Cart not found", 404));
  }
  res.status(200).json({
    status: "success",
    numItems: cart.cartItems.length,
    cart
  });
});

exports.removeProductFromCart = asyncHandler(async (req, res, next) => {
  const cart = await CartModel.findOneAndUpdate(
    { user: req.user._id.toString() },
    {
      $pull: { cartItems: { _id: req.params.itemId } }
    },
    { new: true }
  );
  if (!cart) {
    return next(new ApiError("Cart not found", 404));
  }
  calculateTotalPrice(cart);
  await cart.save();
  res.status(200).json({
    status: "success",
    message: "Product removed from cart successfully",
    numItems: cart.cartItems.length,
    cart
  });
});

exports.clearCart = asyncHandler(async (req, res, next) => {
  await CartModel.findOneAndDelete({ user: req.user._id.toString() });
  res.status(204).send();
});

exports.updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  const { itemId } = req.params;

  if (!quantity || quantity < 1) {
    return next(new ApiError("Invalid quantity", 400));
  }

  const cart = await CartModel.findOneAndUpdate(
    {
      user: req.user._id,
      cartItems: { $elemMatch: { _id: itemId } }
    },
    {
      $set: {
        "cartItems.$.quantity": quantity
      }
    },
    { new: true }
  );

  if (!cart) {
    return next(new ApiError("Cart not found", 404));
  }

  calculateTotalPrice(cart);
  await cart.save();

  res.status(200).json({
    status: "success",
    message: "Product quantity updated successfully",
    numItems: cart.cartItems.length,
    cart
  });
});

exports.applyCoupon = asyncHandler(async (req, res, next) => {
  const { couponCode } = req.body;
  const coupon = await CouponModel.findOne({
    name: couponCode,
    expired: { $gt: Date.now() }
  });
  if (!coupon) {
    return next(new ApiError("Coupon not found", 404));
  }
  const cart = await CartModel.findOne({ user: req.user._id.toString() });
  if (!cart) {
    return next(new ApiError("Cart not found", 404));
  }
  calculateTotalPrice(cart);

  cart.totalPriceAfterDiscount = cart.totalPrice - coupon.discount;

  await cart.save();

  res.status(200).json({
    status: "success",
    message: "Coupon applied successfully",
    discount: coupon.discount,
    cart
  });
});
