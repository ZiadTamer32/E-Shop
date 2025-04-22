const factory = require("./handleFactory");
const CouponModel = require("../models/couponModel");

// Get All Coupon
exports.getCoupons = factory.getAll(CouponModel);
// Get by id
exports.getCouponById = factory.getOne(CouponModel);
// Create Coupon
exports.createCoupon = factory.createOne(CouponModel);
// Update Coupon
exports.updateCoupon = factory.updateOne(CouponModel);
// Delete Coupon
exports.deleteCoupon = factory.deleteOne(CouponModel);
