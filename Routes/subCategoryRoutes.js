const express = require("express");

const router = express.Router({ mergeParams: true });

const {
  createSubCategory,
  getAllSubCategories,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
  setCategoryIdToBody,
  createFilterObj
} = require("../services/subCategoryService");
const {
  createSubCategoryValidator,
  getSubCategoryValidator,
  updateSubCategoryValidator,
  deleteSubCategoryValidator
} = require("../utils/validators/subCategoryValidator");

// Authentication
const { protect, allowedTo } = require("../services/authService");

// Middleware
router
  .route("/")
  .post(
    protect,
    allowedTo("admin"),
    setCategoryIdToBody,
    createSubCategoryValidator,
    createSubCategory
  )
  .get(createFilterObj, getAllSubCategories);

router
  .route("/:id")
  .get(getSubCategoryValidator, getSubCategoryById)
  .put(
    protect,
    allowedTo("admin"),
    updateSubCategoryValidator,
    updateSubCategory
  )
  .delete(
    protect,
    allowedTo("admin"),
    deleteSubCategoryValidator,
    deleteSubCategory
  );

module.exports = router;
