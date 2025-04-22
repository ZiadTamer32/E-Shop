const factory = require("./handleFactory");
const ReviewModel = require("../models/ReviewModel");

// Nested Route (GET)
exports.getAllReviewsByProductId = (req, res, next) => {
  // Allow nested routes
  let filterObj = {};
  if (req.params.productId) filterObj = { product: req.params.productId };
  req.filterObj = filterObj;
  next();
};

// Nested Route (POST)
exports.createReviewByProductId = (req, res, next) => {
  // Allow nested routes
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user._id.toString();
  next();
};

// Get All Review
exports.getReviews = factory.getAll(ReviewModel);
// Get by id
exports.getReviewById = factory.getOne(ReviewModel);
// Create Review
exports.createReview = factory.createOne(ReviewModel);
// Update Review
exports.updateReview = factory.updateOne(ReviewModel);
// Delete Review
exports.deleteReview = factory.deleteOne(ReviewModel);
