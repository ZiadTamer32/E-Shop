const { validationResult } = require("express-validator");
// MiddleWare
const validatorCategory = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({ errors: result.array() });
  }
  next();
};
module.exports = validatorCategory;
