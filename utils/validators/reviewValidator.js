const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/getCategoryByIdMiddleware");
const reviewModel = require("../../models/ReviewModel");

exports.getReviewValidator = [
  // Set Rules
  check("id").isMongoId().withMessage("Invaild Review Id"),
  // Middleware
  validatorMiddleware
];

exports.createReviewValidator = [
  check("title")
    .optional()
    .isLength({ min: 3 })
    .withMessage("must be more than 3")
    .isLength({ max: 32 })
    .withMessage("must be less than 32"),
  check("rating")
    .notEmpty()
    .withMessage("Rating is required")
    .isFloat()
    .withMessage("Rating must be an integer")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  check("user").isMongoId().withMessage("Invalid user id format"),
  check("product")
    .isMongoId()
    .withMessage("Invalid Review id format")
    .custom((value, { req }) => {
      return reviewModel
        .findOne({
          user: req.user._id.toString(),
          product: req.body.product ? req.body.product : req.params.productId
        })
        .then((review) => {
          if (review) {
            return Promise.reject(
              new Error("You already created a review before")
            );
          }
        });
    }),
  validatorMiddleware
];

exports.updateReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invaild Review Id")
    .custom((value, { req }) => {
      return reviewModel.findById(value).then((review) => {
        if (!review) {
          return Promise.reject(new Error("Review not found"));
        }
        if (review.user._id.toString() !== req.user._id.toString()) {
          return Promise.reject(
            new Error("You are not allowed to update this review")
          );
        }
      });
    }),
  validatorMiddleware
];

exports.deleteReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invaild Review Id")
    .custom((value, { req }) => {
      if (req.user.role === "user") {
        return reviewModel.findById(value).then((review) => {
          if (!review) {
            return Promise.reject(new Error("Review not found"));
          }
          if (review.user._id.toString() !== req.user._id.toString()) {
            return Promise.reject(
              new Error("You are not allowed to delete this review")
            );
          }
        });
      }
    }),
  validatorMiddleware
];
