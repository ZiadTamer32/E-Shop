const express = require("express");

const router = express.Router();
const { protect, allowedTo } = require("../services/authService");
const {
  addAddress,
  removeAddress,
  getAddresses
} = require("../services/addressService");

router
  .route("/")
  .post(protect, allowedTo("user"), addAddress)
  .get(protect, allowedTo("user"), getAddresses);

router.route("/:addressId").delete(protect, allowedTo("user"), removeAddress);

module.exports = router;
