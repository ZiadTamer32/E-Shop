const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const morgan = require("morgan");
const compression = require("compression");

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

// ✅ Webhook route comes first (before JSON parsing)
app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  webhookCheckout
);

// ✅ Then apply body parser and other middlewares
app.use(cors());
app.use(express.json());
app.use(compression());
app.use(express.static(path.join(__dirname, "uploads")));

const { NODE_ENV } = process.env;

if (NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`Node now is ${NODE_ENV}`);
}

// Routes
mountRoutes(app);

app.all("*", (req, res, next) => {
  next(new ApiError(`This route not found ${req.originalUrl}`, 500));
});

// Global error handling
app.use(globalError);

// Server start
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Welcome to the server of E-commerce API");
});

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
