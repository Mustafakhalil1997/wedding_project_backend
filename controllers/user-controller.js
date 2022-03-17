const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const { findOne } = require("../models/user");

const User = require("../models/user");

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  console.log("reached signup");
  if (!errors.isEmpty()) {
    console.log("errors ", errors);
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );
  }

  console.log("req.body ", req.body);

  const { id, firstName, lastName, email, password, profileImage } = req.body;

  const createdUser = new User({
    firstName,
    lastName,
    email,
    password,
    profileImage,
    favorites: [],
    hallId: null,
    booking: null,
  });

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Could not sign you up, please try again", 500);
    return next(error);
  }
  console.log("existing user ", existingUser);

  if (existingUser) {
    const error = new HttpError("User already exists, try logging in", 404);
    return next(error);
  }

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("Signing up failed, please try again.", 500);
    return next(error);
  }
  console.log("user Created");
  res.status(200).json({ message: "signed up" });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later",
      500
    );
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError("Email does not exist, try signing up", 404);
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = password === existingUser.password;
  } catch (err) {
    const error = new HttpError(
      "Could not log you in, please check your credentials and try again",
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError("Wrong password, please try again", 401);
    return next(error);
  }

  res.status(200).json({ message: `logged in with ${email}` });
};

const editUser = async (req, res, next) => {
  const userId = res.params.uid;

  const { firstName, lastName, profileImage } = req.body;

  let user;
  try {
    user = await findOne({ id: userId });
  } catch (err) {
    const error = new HttpError(
      "Could not update profile, please try again",
      500
    );
    return next(error);
  }

  user.firstName = firstName;
  user.lastName = lastName;
  user.profileImage = profileImage;

  try {
    await user.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update profile ",
      500
    );
    return next(error);
  }

  res.status(200).json({ user: user.toObject({ getters: true }) });
};

module.exports = { signup, login, editUser };
