const express = require("express");

const router = express.Router();

const {
  getBrand,
  createBrand,
  getBrandById,
  updateBrand,
  deleteBrand,
  imageBrandUpload,
  resizeImage
} = require("../services/brandService");

// Middleware
const {
  getBrandValidator,
  createBrandValidator,
  updateBrandValidator,
  deleteBrandValidator
} = require("../utils/validators/brandValidtor");

//Authentication
const { protect, allowedTo } = require("../services/authService");

router
  .route("/")
  .get(getBrand)
  .post(
    protect,
    allowedTo("admin"),
    imageBrandUpload,
    resizeImage,
    createBrandValidator,
    createBrand
  );
router
  .route("/:id")
  .get(getBrandValidator, getBrandById)
  .put(
    protect,
    allowedTo("admin"),
    imageBrandUpload,
    resizeImage,
    updateBrandValidator,
    updateBrand
  )
  .delete(protect, allowedTo("admin"), deleteBrandValidator, deleteBrand);

module.exports = router;
