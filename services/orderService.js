const stripe = require("stripe")(
  "sk_test_51RGK3fIDoXpCy44eJN4Tdwy0Qd7pUeOOzkugeILdmJpRmADdblIyha8CPGrc4t8Ll72Cg3eWSa4yWMwLlyliGE7i00OGC5PXjl"
);

const asyncHandler = require("express-async-handler");
const factory = require("./handleFactory");
const OrderModel = require("../models/orderModel");
const UserModel = require("../models/UserModel");
const CartModel = require("../models/cartModel");
const ProductModel = require("../models/productModel");
const ApiError = require("../utils/ApiErrors");

// @desc    Create new order Cash
// @route   POST /api/orders
// @access  Private
exports.createOrderCash = asyncHandler(async (req, res, next) => {
  //  App Settings
  const taxPrice = 0;
  const shippingPrice = 0;
  // 1) Get cart items from the params cartId
  const { cartId } = req.params;
  const cart = await CartModel.findById(cartId);
  if (!cart) return next(new ApiError("No cart found", 404));
  // 2) Get price from the depend on cart items and check if copoun is applied
  const { totalPrice, totalPriceAfterDiscount } = cart;
  let price;
  if (totalPriceAfterDiscount !== 0) {
    price = totalPriceAfterDiscount;
  } else {
    price = totalPrice;
  }
  const totalOrderPrice = price + taxPrice + shippingPrice;
  // 3) Create order and save it to the database
  const order = await OrderModel.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    totalPrice: totalOrderPrice,
    shippingAddress: req.body.shippingAddress
  });
  // 4) decrease the quantity of the product and increase the sold of the cart items
  if (order) {
    const bulkOptions = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: {
          $inc: {
            quantity: -item.quantity,
            sold: item.quantity
          }
        }
      }
    }));
    await ProductModel.bulkWrite(bulkOptions);
  }
  // 5) Clear the cart items from the database
  await CartModel.findByIdAndDelete(cartId);
  // 6) Send response
  res.status(201).json({
    status: "success",
    data: {
      order
    }
  });
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
exports.filterOrderForLoggedUser = asyncHandler(async (req, res, next) => {
  if (req.user.role === "user") req.filterObj = { user: req.user._id };
  next();
});

exports.getAllOrders = factory.getAll(OrderModel);

// @desc    Get order by id
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = factory.getOne(OrderModel);

exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await OrderModel.findById(req.params.id);
  if (!order) return next(new ApiError("No order found", 404));
  order.isPaid = true;
  order.paidAt = Date.now();
  const updatedOrder = await order.save();
  res.status(200).json({
    status: "success",
    data: {
      order: updatedOrder
    }
  });
});

exports.updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  const order = await OrderModel.findById(req.params.id);
  if (!order) return next(new ApiError("No order found", 404));
  order.isDelivered = true;
  order.deliveredAt = Date.now();
  const updatedOrder = await order.save();
  res.status(200).json({
    status: "success",
    data: {
      order: updatedOrder
    }
  });
});

exports.checkOutSession = asyncHandler(async (req, res, next) => {
  //  App Settings
  const taxPrice = 0;
  const shippingPrice = 0;
  // 1) Get cart items from the params cartId
  const { cartId } = req.params;
  const cart = await CartModel.findById(cartId);
  if (!cart) return next(new ApiError("No cart found", 404));
  // 2) Get price from the depend on cart items and check if copoun is applied
  const { totalPrice, totalPriceAfterDiscount } = cart;
  let price;
  if (totalPriceAfterDiscount !== 0) {
    price = totalPriceAfterDiscount;
  } else {
    price = totalPrice;
  }
  const totalOrderPrice = price + taxPrice + shippingPrice;
  // 3) Create Checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "egp",
          product_data: {
            name: `Order for ${req.user.name}`
          },
          unit_amount: totalOrderPrice * 100 // Amount in piastres (1 EGP = 100 piastres)
        },
        quantity: 1
      }
    ],
    client_reference_id: req.params.cartId,
    customer_email: req.user.email,
    mode: "payment",
    metadata: req.body.shippingAddress,
    success_url: `${req.protocol}://${req.get("host")}/api/v1/orders`,
    cancel_url: `${req.protocol}://${req.get("host")}/api/v1/cart`
  });
  // 4) Send response
  res.status(200).json({
    status: "success",
    session
  });
});

const endPointSecret = "whsec_eOwWVvfO7ihIiPDn9vJCZ2AWMpaLJKVP";

const createCardOrder = async (session) => {
  try {
    const cartId = session.client_reference_id;
    const shippingAddress = session.metadata;
    const orderPrice = session.amount_total / 100;

    console.log("Cart Id :", cartId);
    console.log("Shipping Address :", shippingAddress);
    console.log("Order Price :", orderPrice);

    const cart = await CartModel.findById(cartId);
    const user = await UserModel.findOne({ email: session.customer_email });

    if (!cart || !user) {
      console.error("Cart or User not found");
      return;
    }

    const order = await OrderModel.create({
      user: user._id,
      cartItems: cart.cartItems,
      shippingAddress,
      totalPrice: orderPrice,
      isPaid: true,
      paidAt: Date.now(),
      paymentMethod: "card"
    });

    if (order) {
      const bulkOption = cart.cartItems.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { quantity: -item.quantity, sold: +item.quantity } }
        }
      }));

      await ProductModel.bulkWrite(bulkOption);
      await CartModel.findByIdAndDelete(cartId);
    }
  } catch (err) {
    console.error("Failed to create order from Stripe session:", err);
  }
};

exports.webhookCheckout = asyncHandler(async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endPointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Send 200 OK early
  res.status(200).json({ received: true });

  // Then handle the event asynchronously
  if (event.type === "checkout.session.completed") {
    console.log("✅ Payment was successful. Creating order...");
    await createCardOrder(event.data.object);
  }
});
