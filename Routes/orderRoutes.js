const express = require("express");

const router = express.Router();

const {
  createOrderCash,
  getAllOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  filterOrderForLoggedUser,
  checkOutSession
} = require("../services/orderService");
const { protect, allowedTo } = require("../services/authService");

router.use(protect);
router.route("/:cartId").post(allowedTo("user"), createOrderCash);
router.get("/checkout-session/:cartId", allowedTo("user"), checkOutSession);
router
  .route("/")
  .get(allowedTo("admin", "user"), filterOrderForLoggedUser, getAllOrders);
router.route("/:id").get(allowedTo("admin", "user"), getOrderById);
router.route("/:id/pay").put(allowedTo("admin"), updateOrderToPaid);
router.route("/:id/deliver").put(allowedTo("admin"), updateOrderToDelivered);
// router
module.exports = router;
