const express = require("express");

const router = express.Router({ mergeParams: true });

const {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  getAllReviewsByProductId,
  createReviewByProductId
} = require("../services/reviewService");
const {
  createReviewValidator,
  getReviewValidator,
  updateReviewValidator,
  deleteReviewValidator
} = require("../utils/validators/reviewValidator");

const { protect, allowedTo } = require("../services/authService");

router
  .route("/")
  .get(getAllReviewsByProductId, getReviews)
  .post(
    protect,
    allowedTo("user"),
    createReviewByProductId,
    createReviewValidator,
    createReview
  );

router
  .route("/:id")
  .get(getReviewValidator, getReviewById)
  .put(protect, allowedTo("user"), updateReviewValidator, updateReview)
  .delete(protect, allowedTo("user"), deleteReviewValidator, deleteReview);

module.exports = router;
