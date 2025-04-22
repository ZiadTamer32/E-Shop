const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const asyncHandler = require("express-async-handler");
const UserModel = require("../models/UserModel");
const ApiError = require("../utils/ApiErrors");
const sendEmail = require("../utils/sendEmail");

exports.signUp = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;
  const user = await UserModel.create({ name, email, password });
  // Generate Token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
  res.status(201).json({ data: user, token });
});

exports.login = asyncHandler(async (req, res, next) => {
  req.user.password = undefined;
  const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
  res.status(200).json({ data: req.user, token });
});

exports.protect = asyncHandler(async (req, res, next) => {
  // 1- Get token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new ApiError("You are not authenticated!", 401));
  }
  // 2- Verification token (not expired,not changed)
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // 3- Check if user still exists
  const currentUser = await UserModel.findById(decoded.userId);
  if (!currentUser) {
    return next(
      new ApiError("The user belonging to this token does no longer exist", 401)
    );
  }
  //  4- Check if user changed password after the token was issued
  if (currentUser.passwordChangedAt) {
    const convetToTime = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    ); // Convert ms to seconds
    if (convetToTime > decoded.iat) {
      return next(
        new ApiError("User recently changed password. Please login again!", 401)
      );
    }
  }
  req.user = currentUser; // Store user in `req` for later use
  next();
});

exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You do not have permission to perform this action", 403)
      );
    }
    next();
  });
exports.ForgetPassword = asyncHandler(async (req, res, next) => {
  // 1- Check if user exists
  const user = await UserModel.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError("No user with this email found", 404));
  }
  // 2- Generate random reset token and hash it in database by crypto
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  user.passwordReset = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");
  user.passwordResetExpires = Date.now() + 3600000; // 1 hour
  user.isVerified = false;
  await user.save();
  // 3- send resetCode to via email
  try {
    await sendEmail({
      email: user.email,
      subject: "Reset Password Code (Valid for 1 hour)",
      message: `Hi,${user.name} \n Your reset code is: ${resetCode} \n Please enter the following code to complete reset password`
    });
  } catch (err) {
    user.passwordReset = undefined;
    user.passwordResetExpires = undefined;
    user.isVerified = undefined;
    await user.save();
    return next(
      new ApiError("Failed to send email. Please try again later.", 500)
    );
  }
  res.status(200).json({ message: "Reset code sent to your email" });
});

exports.verfiyPasswordResetCode = asyncHandler(async (req, res, next) => {
  const { resetCode } = req.body;
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");
  const user = await UserModel.findOne({
    passwordReset: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() }
  });
  if (!user) {
    return next(new ApiError("Reset code is invalid or has expired", 400));
  }
  user.passwordReset = undefined;
  user.passwordResetExpires = undefined;
  user.isVerified = true;
  await user.save();
  res.status(200).json({ message: "Reset code is valid" });
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError("No user with this email found", 404));
  }
  if (!user.isVerified) {
    return next(new ApiError("Please verify your email first", 400));
  }
  const isSame = await bcrypt.compare(req.body.newPassword, user.password);
  if (isSame) {
    return next(
      new ApiError("New password must be different from old password", 400)
    );
  }
  user.password = req.body.newPassword;
  user.passwordReset = undefined;
  user.passwordResetExpires = undefined;
  user.isVerified = false;
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
  await user.save();
  res.status(200).json({ message: "Password reset successfully", token });
});
