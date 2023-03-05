const notFound = (req, res, next) => {
  const error = new HttpError("Could not find this route", 404);
  return next(error);
};

module.exports = notFound;
