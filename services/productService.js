const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const productModel = require("../models/productModel");
const factory = require("./handleFactory");
const { multiImagesUpload } = require("../middlewares/uploadImageMiddleware");

// Upload ImageCover
exports.uploadProductImage = multiImagesUpload([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 5 }
]);
exports.resizeImages = asyncHandler(async (req, res, next) => {
  if (req.files.imageCover) {
    const fileName = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/products/${fileName}`);
    // Save For Database
    req.body.imageCover = fileName;
  }
  if (req.files.images) {
    req.body.images = await Promise.all(
      req.files.images.map(async (file, index) => {
        const fileName = `product-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;
        await sharp(file.buffer)
          .resize(600, 600)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`uploads/products/${fileName}`);
        return fileName;
      })
    );
  }
  next();
});
// Get All Products
exports.getProducts = factory.getAll(productModel, "Products", "category");
// Get by id
exports.getProductById = factory.getOne(productModel, {
  path: "reviews",
  select: "title rating -_id -product"
});
// Create Product
exports.createProduct = factory.createOne(productModel);
// Update Product
exports.updateProduct = factory.updateOne(productModel);
// Delete Product
exports.deleteProduct = factory.deleteOne(productModel);
