const express = require("express");

const router = express.Router();

const {
  deleteProduct,
  updateProduct,
  createProduct,
  getProductById,
  getProducts,
  uploadProductImage,
  resizeImages
} = require("../services/productService");

const {
  createProductValidator,
  updateProductValidator,
  getProductsByIdValidator,
  deleteProductValidator
} = require("../utils/validators/productValidator");

// Authentication
const { protect, allowedTo } = require("../services/authService");

// Nested Routes
const reviewRouter = require("./reviewRoutes");

router.use("/:productId/review", reviewRouter);

router
  .route("/")
  .get(getProducts)
  .post(
    protect,
    allowedTo("admin"),
    uploadProductImage,
    resizeImages,
    createProductValidator,
    createProduct
  );
router
  .route("/:id")
  .get(getProductsByIdValidator, getProductById)
  .put(protect, allowedTo("admin"), updateProductValidator, updateProduct)
  .delete(protect, allowedTo("admin"), deleteProductValidator, deleteProduct);

module.exports = router;
