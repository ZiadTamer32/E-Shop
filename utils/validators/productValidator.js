const { check, body } = require("express-validator");
const slugify = require("slugify");
const validatorProduct = require("../../middlewares/getCategoryByIdMiddleware");
const CategoryModel = require("../../models/categoryModel");
const subCategoryModel = require("../../models/subCategoryModel");

exports.createProductValidator = [
  check("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3 })
    .withMessage("Title must be more than 3 characters")
    .isLength({ max: 128 })
    .withMessage("Title must be less than 128 characters")
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),

  check("description")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10 })
    .withMessage("Description must be more than 10 characters")
    .isLength({ max: 2000 })
    .withMessage("Description must be less than 2000 characters"),

  check("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  check("priceAfterDiscount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Discount must be a positive number")
    .custom((value, { req }) => {
      if (req.body.price <= value) {
        throw new Error(
          "Discount cannot be greater than or equal to the price"
        );
      }
      return true;
    }),

  check("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ min: 0 })
    .withMessage("Quantity must be a positive integer"),

  check("category")
    .notEmpty()
    .withMessage("Category is required")
    .isMongoId()
    .withMessage("Invalid category id format")
    .custom((id) => {
      return CategoryModel.findById(id).then((category) => {
        if (!category) {
          return Promise.reject(`No category found for this id: ${id}`);
        }
      });
    }),

  check("subcategory")
    .optional()
    .isMongoId()
    .withMessage("Invalid subcategory id format")
    .custom((subCategoryId) => {
      // Ensure subCategoryId is always treated as an array
      const subCategoryIds = Array.isArray(subCategoryId)
        ? subCategoryId
        : [subCategoryId];

      return subCategoryModel
        .find({ _id: { $exists: true, $in: subCategoryIds } }) // Find all matching subcategories
        .then((subcategories) => {
          // Check if all provided subcategory IDs exist in the database
          if (subcategories.length !== subCategoryIds.length) {
            const missingIds = subCategoryIds.filter(
              (id) =>
                !subcategories.some(
                  (cat) => cat._id.toString() === id.toString()
                )
            );
            return Promise.reject(
              `No subcategory found for these ids: ${missingIds.join(", ")}`
            );
          }
        });
    })
    .custom((value, { req }) => {
      return subCategoryModel
        .find({ parent: req.body.category })
        .then((cat) => {
          const subCategoriesIds = cat.map((item) => item._id.toString());
          const checker = value.filter((id) =>
            subCategoriesIds.includes(id.toString())
          );
          if (checker.length <= 1) {
            return Promise.reject("Subcategory not found in parent category");
          }
        });
    }),
  check("brand").optional().isMongoId().withMessage("Invalid brand id format"),

  check("imageCover").notEmpty().withMessage("Image Cover is required"),

  check("images")
    .optional()
    .isArray()
    .withMessage("Images must be an array of strings"),

  check("colors")
    .optional()
    .isArray()
    .withMessage("Colors must be an array of strings"),

  check("sold")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Sold must be a positive integer"),

  check("ratingsAverage")
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage("RatingsAverage must be a number between 0 and 5"),

  check("ratingsQuantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("RatingsQuantity must be a positive integer"),

  validatorProduct
];

exports.updateProductValidator = [
  check("id").isMongoId().withMessage("Invalid Product Id"),
  body("title")
    .optional()
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  validatorProduct
];

exports.deleteProductValidator = [
  check("id").isMongoId().withMessage("Invalid Product Id"),
  validatorProduct
];

exports.getProductsByIdValidator = [
  check("id").isMongoId().withMessage("Invalid Category Id"),
  validatorProduct
];
