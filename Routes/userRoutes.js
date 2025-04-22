const express = require("express");

const router = express.Router();

const {
  getUser,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  imageUserUpload,
  resizeImage,
  changePassword,
  getLoggedUser,
  updatePasswordForLoggedUser,
  updateLoggedUser,
  deactiveUser
} = require("../services/userService");

// Middleware
const {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changePasswordValidator,
  updateLoggedUserValidator,
  changePasswordLogged
} = require("../utils/validators/userValidtor");

// Authentication
const { protect, allowedTo } = require("../services/authService");

router.route("/getMe").get(protect, getLoggedUser, getUserById);
router
  .route("/changeMyPassword")
  .put(protect, changePasswordLogged, updatePasswordForLoggedUser);
router
  .route("/updateMyData")
  .put(
    protect,
    imageUserUpload,
    resizeImage,
    updateLoggedUserValidator,
    updateLoggedUser
  );
router.route("/deleteMe").delete(protect, deactiveUser);

router
  .route("/change-password/:id")
  .put(changePasswordValidator, changePassword);

router
  .route("/")
  .get(protect, allowedTo("admin"), getUser)
  .post(
    protect,
    allowedTo("admin"),
    imageUserUpload,
    resizeImage,
    createUserValidator,
    createUser
  );
router
  .route("/:id")
  .get(protect, allowedTo("admin"), getUserValidator, getUserById)
  .put(
    protect,
    allowedTo("admin"),
    imageUserUpload,
    resizeImage,
    updateUserValidator,
    updateUser
  )
  .delete(protect, allowedTo("admin"), deleteUserValidator, deleteUser);

module.exports = router;
