const errorMiddleware = (error, req, res, next) => {
  if (req.file) {
    // delete uploaded image if there is an error
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500).json({ message: error.message || "An unknown error occurred!" });
};

module.exports = errorMiddleware;
