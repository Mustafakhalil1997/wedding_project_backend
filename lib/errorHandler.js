const HttpError = require("../models/http-error");

const errorHandler = (errors, error, next) => {
  Object.values(errors).filter((err) => {
    if (err.key === error.message) return next(new HttpError(err.message, err.code));
  });
  return next(error);
};

module.exports = errorHandler;
