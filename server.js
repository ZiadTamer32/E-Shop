const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger_output.json");

const ApiError = require("./utils/ApiErrors");
const globalError = require("./middlewares/errorMiddleware");
const dbConnection = require("./config/database");
const { webhookCheckout } = require("./services/orderService");

// Routes
const mountRoutes = require("./Routes/index");

// env
dotenv.config({ path: "config.env" });

// Database
dbConnection();

// express app
const app = express();

// Webhook route comes first (before JSON parsing)
app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  webhookCheckout
);

// Then apply body parser and other middlewares
app.use(cors());
app.use(express.json({ limit: "20kb" }));
app.use(compression());
app.use(express.static(path.join(__dirname, "uploads")));

const { NODE_ENV } = process.env;

if (NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`Node now is ${NODE_ENV}`);
}

// To remove data using these defaults:
app.use(mongoSanitize());
app.use(xss());

// Limit each IP to 100 requests per `window` (here, per 15 minutes).
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 50,
  message: "Too many requests from this IP, please try again in 15 minutes."
});

// Apply the rate limiting middleware to all requests.
app.use("/api", limiter);

// Prevent http param pollution
app.use(
  hpp({
    whitelist: [
      "price",
      "ratingsAverage",
      "ratingsQuantity",
      "quantity",
      "sold"
    ]
  })
);

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
mountRoutes(app);

app.all("*", (req, res, next) => {
  next(new ApiError(`This route not found ${req.originalUrl}`, 500));
});

// Global error handling
app.use(globalError);

// Server start
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`App running at port ${PORT}`);
});

// Handle unhandled rejections
process.on("unhandledRejection", (error) => {
  console.error("UnhandledRejection connection error:", error.message);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;
