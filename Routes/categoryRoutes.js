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

router.get("/", getCategory);

router.post(
  "/",
  protect,
  allowedTo("admin"),
  imageCategoryUplaod,
  resizeImage,
  createCategoryValidator,
  createCategory
);

router.get("/:id", getCategoryValidator, getCategoryById);

router.put(
  "/:id",
  protect,
  allowedTo("admin"),
  imageCategoryUplaod,
  resizeImage,
  updateCategoryValidator,
  updateCategry
);

router.delete(
  "/:id",
  protect,
  allowedTo("admin"),
  deleteCategoryValidator,
  deleteCategory
);

module.exports = router;
