const { check } = require("express-validator");
const bcrypt = require("bcryptjs");
const slugify = require("slugify");
const validatorMiddleware = require("../../middlewares/getCategoryByIdMiddleware");
const UserModel = require("../../models/UserModel");

exports.signUpValidator = [
  check("name")
    .notEmpty()
    .withMessage("User name is required")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters")
    .isLength({ max: 32 })
    .withMessage("Name must be at most 32 characters")
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),

  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (value) => {
      const existingUser = await UserModel.findOne({ email: value });
      if (existingUser) {
        return Promise.reject("Email already exists");
      }
      return true;
    }),

  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  check("confirmPassword")
    .notEmpty()
    .withMessage("Confirm Password is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

  validatorMiddleware
];

exports.loginValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (value, { req }) => {
      const user = await UserModel.findOne({ email: value });
      if (!user) {
        return Promise.reject("User does not exist");
      }
      req.user = user; // Store user in `req` for later use
      return true;
    }),

  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .custom(async (value, { req }) => {
      if (!req.user) {
        return Promise.reject("Invalid Credentials");
      }
      // Compare plain text entered password with the stored hashed password
      const isMatch = await bcrypt.compare(value, req.user.password);
      if (!isMatch) {
        return Promise.reject("Invalid Credentials Password");
      }
      return true;
    }),

  validatorMiddleware
];
