
const jwt = require('jsonwebtoken');
const appError = require('../utils/appError');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["Authorization"] || req.headers["authorization"];

  if (!authHeader) {
    const error = appError.create("No token provided", 403, "Fail");
    return next(error);
  }

  const token = authHeader.split(' ')[1];

   jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      const error = appError.create("Invalid or expired token", 403, "Fail");
      return next(error);
    }
    req.userAuth = decoded;
    next();
  });
}

module.exports = verifyToken;
