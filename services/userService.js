const sharp = require("sharp");
const jwt = require("jsonwebtoken");
const slugify = require("slugify");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const factory = require("./handleFactory");
const UserModel = require("../models/UserModel");
const ApiError = require("../utils/ApiErrors");
const { singleImageUpload } = require("../middlewares/uploadImageMiddleware");

// Upload Singe Image
exports.imageUserUpload = singleImageUpload("avatar");
// Images Processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const fileName = `avatar-${uuidv4()}-${Date.now()}.jpeg`;
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/users/${fileName}`);
    // Save For Database
    req.body.avatar = fileName;
  }
  next();
});
// Get All Users
exports.getUser = factory.getAll(UserModel);
// Get by id
exports.getUserById = factory.getOne(UserModel);
// Create User
exports.createUser = factory.createOne(UserModel);
// Update User
exports.updateUser = asyncHandler(async (req, res, next) => {
  const document = await UserModel.findById(req.params.id);
  if (!document) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }
  const updateData = {
    name: req.body.name,
    slug: req.body.name ? slugify(req.body.name) : document.slug,
    email: req.body.email,
    phone: req.body.phone,
    avatar: req.body.avatar ? req.body.avatar : document.avatar,
    role: req.body.role
  };
  const documentUpdated = await UserModel.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );
  if (!documentUpdated) {
    return next(new ApiError(`No Document for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: documentUpdated });
});
// Change Password
exports.changePassword = asyncHandler(async (req, res, next) => {
  const documentUpdated = await UserModel.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now()
    },
    { new: true, runValidators: true }
  );
  if (!documentUpdated) {
    return next(new ApiError(`No Document for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: documentUpdated });
});
// Delete User
exports.deleteUser = factory.deleteOne(UserModel);
// Get Logged data by id
exports.getLoggedUser = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  if (!req.params.id) {
    return next(new ApiError(`No Document for this id ${req.params.id}`, 404));
  }
  next();
});
// Update Password
exports.updatePasswordForLoggedUser = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findById(req.user._id);

  if (!user) {
    return next(new ApiError("User not found", 404));
  }

  user.password = await bcrypt.hash(req.body.password, 12);
  user.passwordChangedAt = new Date(Date.now() - 1000);
  await user.save();

  // Generate new JWT token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  res.status(200).json({
    message: "Password updated successfully",
    token,
    data: user
  });
});

// Update Logged User
exports.updateLoggedUser = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      avatar: req.body.avatar
    },
    { new: true }
  );
  res.status(200).json({ data: user });
});
// DeActive User
exports.deactiveUser = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    { active: false },
    { new: true }
  );
  if (!user) {
    return next(new ApiError(`No Document for this id ${req.params.id}`, 404));
  }
  res.status(204).json({ message: "User Deactivated" });
});
