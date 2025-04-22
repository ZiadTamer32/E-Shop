const { check, body } = require("express-validator");
const slugify = require("slugify");
const validatorMiddleware = require("../../middlewares/getCategoryByIdMiddleware");

exports.getBrandValidator = [
  // Set Rules
  check("id").isMongoId().withMessage("Invaild Brand Id"),
  // Middleware
  validatorMiddleware
];

exports.createBrandValidator = [
  check("name")
    .notEmpty()
    .withMessage("Brand name is requierd")
    .isLength({ min: 3 })
    .withMessage("must be more than 3")
    .isLength({ max: 32 })
    .withMessage("must be less than 32")
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  validatorMiddleware
];

exports.updateBrandValidator = [
  check("id").isMongoId().withMessage("Invaild Brand Id"),
  body("name")
    .optional()
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  validatorMiddleware
];

exports.deleteBrandValidator = [
  check("id").isMongoId().withMessage("Invaild Brand Id"),
  validatorMiddleware
];
