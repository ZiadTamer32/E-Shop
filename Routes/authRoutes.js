const express = require("express");

const router = express.Router();

const {
  signUp,
  login,
  ForgetPassword,
  verfiyPasswordResetCode,
  resetPassword
} = require("../services/authService");

// Middleware
const {
  signUpValidator,
  loginValidator
} = require("../utils/validators/authValidator");

router.post("/signup", signUpValidator, signUp);
router.post("/login", loginValidator, login);
router.post("/forget-password", ForgetPassword);
router.post("/verfiy-password-reset-code", verfiyPasswordResetCode);
router.put("/reset-password", resetPassword);

module.exports = router;
