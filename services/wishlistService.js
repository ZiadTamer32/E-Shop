const asyncHandler = require("express-async-handler");

const UserModel = require("../models/UserModel");

exports.addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { wishlist: productId } },
    { new: true }
  );
  res.status(200).json({
    message: "Product added to wishlist",
    data: user.wishlist
  });
});

exports.removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    { $pull: { wishlist: productId } },
    { new: true }
  );
  res.status(200).json({
    message: "Product removed from wishlist",
    data: user.wishlist
  });
});

exports.getWishlist = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user._id).populate("wishlist");
  res.status(200).json({
    message: "Wishlist retrieved successfully",
    data: user.wishlist
  });
});
