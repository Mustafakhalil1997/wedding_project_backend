const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");

const signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("errors ", errors);
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );
  }

  console.log("req.body ", req.body);

  const { id, firstName, lastName, email, password, profileImage, favorites } =
    req.body;

  res.json({ message: "signed up" });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  res.status(200).json({ message: `logged in with ${email}` });
};

module.exports = { signup, login };
