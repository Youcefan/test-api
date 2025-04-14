const appError = require("../utils/appError");

module.exports = (req, res, next) => {
  const idAuth = req.userAuth.id;
  const userId = req.params.userId;

  if (userId !== idAuth) {
    return next(appError.create("Not allowed to update", 400, "fail"));
  }

  next();
};