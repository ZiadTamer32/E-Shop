const { check, body } = require("express-validator");
const slugify = require("slugify");
const validatorCategory = require("../../middlewares/getCategoryByIdMiddleware");

exports.getCategoryValidator = [
  // Set Rules
  check("id").isMongoId().withMessage("Invaild Category Id"),
  // Middleware
  validatorCategory
];

exports.createCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("Category name is requierd")
    .isLength({ min: 3 })
    .withMessage("must be more than 3")
    .isLength({ max: 32 })
    .withMessage("must be less than 32")
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  validatorCategory
];

exports.updateCategoryValidator = [
  check("id").isMongoId().withMessage("Invaild Category Id"),
  body("name")
    .optional()
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  validatorCategory
];

exports.deleteCategoryValidator = [
  check("id").isMongoId().withMessage("Invaild Category Id"),
  validatorCategory
];
