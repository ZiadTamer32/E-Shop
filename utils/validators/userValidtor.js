const { check, body } = require("express-validator");
const bcrypt = require("bcryptjs");
const slugify = require("slugify");
const validatorMiddleware = require("../../middlewares/getCategoryByIdMiddleware");
const UserModel = require("../../models/UserModel");

exports.getUserValidator = [
  // Set Rules
  check("id").isMongoId().withMessage("Invaild User Id"),
  // Middleware
  validatorMiddleware
];

exports.createUserValidator = [
  check("name")
    .notEmpty()
    .withMessage("User name is requierd")
    .isLength({ min: 3 })
    .withMessage("must be more than 3")
    .isLength({ max: 32 })
    .withMessage("must be less than 32")
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .custom((value) => {
      return UserModel.findOne({ email: value }).then((email) => {
        if (email) {
          return Promise.reject("Email already exists");
        }
        return true;
      });
    }),
  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("must be more than 3"),
  check("confirmPassword")
    .notEmpty()
    .withMessage("Confirm Password is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password does not match");
      }
      return true;
    }),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage(
      "Invalid phone number format , please enter a valid phone number Egyptian or Saudi"
    ),
  check("avatar").optional(),
  check("role").optional(),
  validatorMiddleware
];

exports.updateUserValidator = [
  check("id").isMongoId().withMessage("Invaild User Id"),
  body("name")
    .optional()
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  check("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email format")
    .custom((value) => {
      return UserModel.findOne({ email: value }).then((email) => {
        if (email) {
          return Promise.reject("Email already exists");
        }
        return true;
      });
    }),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage(
      "Invalid phone number format , please enter a valid phone number Egyptian or Saudi"
    ),
  check("avatar").optional(),
  check("role").optional(),
  validatorMiddleware
];

exports.changePasswordValidator = [
  check("id").isMongoId().withMessage("Invaild User Id"),
  body("currentPassword")
    .notEmpty()
    .withMessage("Current Password is required")
    .custom(async (value, { req }) => {
      const user = await UserModel.findById(req.params.id);

      if (!user) {
        throw new Error("User not found");
      }

      const isMatch = await bcrypt.compare(value, user.password);
      if (!isMatch) {
        throw new Error("Current Password is incorrect");
      }
      return true;
    }),

  body("password").notEmpty().withMessage("New Password is required"),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm Password is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password does not match");
      }
      return true;
    }),

  validatorMiddleware
];

exports.deleteUserValidator = [
  check("id").isMongoId().withMessage("Invaild User Id"),
  validatorMiddleware
];

exports.changePasswordLogged = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current Password is required")
    .custom(async (value, { req }) => {
      const user = await UserModel.findById(req.user._id.toString());

      if (!user) {
        throw new Error("User not found");
      }

      const isMatch = await bcrypt.compare(value, user.password);
      if (!isMatch) {
        throw new Error("Current Password is incorrect");
      }
      return true;
    }),

  body("password").notEmpty().withMessage("New Password is required"),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm Password is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password does not match");
      }
      req.user.password = value;
      return true;
    }),
  validatorMiddleware
];

exports.updateLoggedUserValidator = [
  body("name")
    .optional()
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  check("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email format")
    .custom((value) => {
      return UserModel.findOne({ email: value }).then((email) => {
        if (email) {
          return Promise.reject("Email already exists");
        }
        return true;
      });
    }),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage(
      "Invalid phone number format , please enter a valid phone number Egyptian or Saudi"
    ),
  check("avatar").optional(),
  validatorMiddleware
];
