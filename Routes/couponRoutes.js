const express = require("express");

const router = express.Router();

const {
  getCoupons,
  createCoupon,
  getCouponById,
  updateCoupon,
  deleteCoupon
} = require("../services/couponService");

//Authentication
const { protect, allowedTo } = require("../services/authService");

router.use(protect, allowedTo("admin"));

router.route("/").get(getCoupons).post(createCoupon);

router.route("/:id").get(getCouponById).put(updateCoupon).delete(deleteCoupon);

module.exports = router;
