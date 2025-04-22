const asyncHandler = require("express-async-handler");

const UserModel = require("../models/UserModel");

exports.addAddress = asyncHandler(async (req, res) => {
  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { address: req.body } },
    { new: true }
  );
  res.status(200).json({
    message: "Address added successfully",
    data: user.address
  });
});

exports.removeAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    { $pull: { address: { _id: addressId } } },
    { new: true }
  );
  res.status(200).json({
    message: "Address removed successfully",
    data: user.address
  });
});

exports.getAddresses = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user._id).populate("address");
  res.status(200).json({
    message: "Address retrieved successfully",
    data: user.address
  });
});
