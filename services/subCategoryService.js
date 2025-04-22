const subCategoryModel = require("../models/subCategoryModel");
const factory = require("./handleFactory");
// create category
// middleware for parent before validator
exports.setCategoryIdToBody = (req, res, next) => {
  // Nested Route (Create)
  if (!req.body.parent) req.body.parent = req.params.categoryId;
  next();
};
// Nested Route (GET)
exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryId) filterObject = { parent: req.params.categoryId };
  req.filterObj = filterObject;
  next();
};
//  Get all categories
exports.getAllSubCategories = factory.getAll(subCategoryModel, "", "parent");
// Get specific categories by id
exports.getSubCategoryById = factory.getOne(subCategoryModel, "parent");
// Create Subcategory
exports.createSubCategory = factory.createOne(subCategoryModel);
// Update Category
exports.updateSubCategory = factory.updateOne(subCategoryModel);
// Delete Category
exports.deleteSubCategory = factory.deleteOne(subCategoryModel);
