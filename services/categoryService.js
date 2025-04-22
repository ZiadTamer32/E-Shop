const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const categoryModel = require("../models/categoryModel");
const factory = require("./handleFactory");
const { singleImageUpload } = require("../middlewares/uploadImageMiddleware");

// Middleware For image
exports.imageCategoryUplaod = singleImageUpload("image");
// Resize Image
exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (req.file) {
    const fileName = `category-${uuidv4()}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/categories/${fileName}`);
    // Save For Database
    req.body.image = fileName;
  }
  next();
});
// Get All Category
exports.getCategory = factory.getAll(categoryModel);
// Get by id
exports.getCategoryById = factory.getOne(categoryModel);
// Create Category
exports.createCategory = factory.createOne(categoryModel);
// Update Category
exports.updateCategry = factory.updateOne(categoryModel);
// Delete Category
exports.deleteCategory = factory.deleteOne(categoryModel);
