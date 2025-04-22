const express = require("express");

const router = express.Router();

const {
  getCategory,
  createCategory,
  getCategoryById,
  updateCategry,
  deleteCategory,
  imageCategoryUplaod,
  resizeImage
} = require("../services/categoryService");

const {
  getCategoryValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator
} = require("../utils/validators/categoryValidator");

// Authentication
const { protect, allowedTo } = require("../services/authService");

const subcategoriesRoute = require("./subCategoryRoutes");

router.use("/:categoryId/subcategories", subcategoriesRoute);

router
  .route("/")
  .get(getCategory)
  .post(
    protect,
    allowedTo("admin"),
    imageCategoryUplaod,
    resizeImage,
    createCategoryValidator,
    createCategory
  );
router
  .route("/:id")
  .get(getCategoryValidator, getCategoryById)
  .put(
    protect,
    allowedTo("admin"),
    imageCategoryUplaod,
    resizeImage,
    updateCategoryValidator,
    updateCategry
  )
  .delete(protect, allowedTo("admin"), deleteCategoryValidator, deleteCategory);

module.exports = router;
