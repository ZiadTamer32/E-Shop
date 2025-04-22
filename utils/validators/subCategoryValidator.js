const { check, body } = require("express-validator");
const slugify = require("slugify");
const validatorSubCategory = require("../../middlewares/getCategoryByIdMiddleware");

exports.getSubCategoryValidator = [
  // Set Rules
  check("id").isMongoId().withMessage("Invaild SubCategory Id"),
  // Middleware
  validatorSubCategory
];

exports.createSubCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("SubCategory name is requierd")
    .isLength({ min: 2 })
    .withMessage("must be more than 2")
    .isLength({ max: 32 })
    .withMessage("must be less than 32")
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  check("parent")
    .notEmpty()
    .withMessage("SubCategory name is requierd")
    .isMongoId()
    .withMessage("Invalid parent category id format"),
  validatorSubCategory
];

exports.updateSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invaild SubCategory Id"),
  body("name").custom((value, { req }) => {
    req.body.slug = slugify(value);
    return true;
  }),
  validatorSubCategory
];

exports.deleteSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invaild SubCategory Id"),
  validatorSubCategory
];
