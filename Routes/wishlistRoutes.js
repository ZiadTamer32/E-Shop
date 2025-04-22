const express = require("express");

const router = express.Router();
const { protect, allowedTo } = require("../services/authService");
const {
  addToWishlist,
  removeFromWishlist,
  getWishlist
} = require("../services/wishlistService");

router
  .route("/")
  .post(protect, allowedTo("user"), addToWishlist)
  .get(protect, allowedTo("user"), getWishlist);

router
  .route("/:productId")
  .delete(protect, allowedTo("user"), removeFromWishlist);

module.exports = router;
