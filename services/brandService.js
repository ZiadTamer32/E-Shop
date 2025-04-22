const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const factory = require("./handleFactory");
const BrandModel = require("../models/BrandModel");
const { singleImageUpload } = require("../middlewares/uploadImageMiddleware");

// Upload Singe Image
exports.imageBrandUpload = singleImageUpload("image");
// Images Processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (req.file) {
    const fileName = `brand-${uuidv4()}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/brands/${fileName}`);
    // Save For Database
    req.body.image = fileName;
  }
  next();
});
// Get All Brand
exports.getBrand = factory.getAll(BrandModel);
// Get by id
exports.getBrandById = factory.getOne(BrandModel);
// Create Brand
exports.createBrand = factory.createOne(BrandModel);
// Update Brand
exports.updateBrand = factory.updateOne(BrandModel);
// Delete Brand
exports.deleteBrand = factory.deleteOne(BrandModel);
