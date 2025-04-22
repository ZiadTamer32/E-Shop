const ApiError = require("../utils/ApiErrors");

const sendErrorForDev = (err, res) =>
  res.status(err.statusCode).json({
    error: err,
    message: err.message,
    stack: err.stack
  });

// Handle Errors outside express
const sendErrorForProd = (err, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
const handleJWTError = () => {
  return new ApiError("Invalid Token , Please login again", 401);
};
const handleJWTExpiredError = () => {
  return new ApiError("Expired Token , Please login again", 401);
};
// Global Error Handler middleware
const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    sendErrorForDev(err, res);
  } else {
    if (err.name === "JsonWebTokenError") err = handleJWTError(err);
    if (err.name === "TokenExpiredError") err = handleJWTExpiredError(err);
    sendErrorForProd(err, res);
  }
};

module.exports = globalError;
