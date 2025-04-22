const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const morgan = require("morgan");
const compression = require("compression");

const ApiError = require("./utils/ApiErrors");
const globalError = require("./middlewares/errorMiddleware");
const dbConnection = require("./config/database");

// Routes
const mountRoutes = require("./Routes/index");

// env
dotenv.config({ path: "config.env" });

// Database
dbConnection();

// express app
const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// compress all responses
app.use(compression());

// MiddleWares
app.use(express.json());
app.use(express.static(path.join(__dirname, "uploads"))); // To serve static files || مخصص Route الوصول إليه مباشرة عبر المتصفح دون الحاجة إلى كتابة ||  http://localhost:8000/categories/profile.jpeg
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

// Global errors in express only
app.use(globalError);

// Ports
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Welcome to the server of E-commerce API");
});

// const server = app.listen(PORT, () => {
//   console.log(`App running at port ${PORT}`);
// });
module.exports = app;

//  Handle Errors outside express
process.on("unhandledRejection", (error) => {
  console.error("UnhandledRejection connection error:", error.message);
  server.close(() => {
    process.exit(1);
  });
});
