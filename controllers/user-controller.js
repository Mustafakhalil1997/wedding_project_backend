const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const HttpError = require("../models/http-error");
// const { findOne } = require("../models/user");

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

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12); // 12 salting rounds
  } catch (err) {
    const error = new HttpError(
      "Could not create user, please try again.",
      500
    );
    return next(error);
  }
  const createdUser = new User({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    profileImage,
    favorites: [],
    hallId: null,
    booking: null,
  });

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
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError("Could not log you in, please try again", 500);
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError("Wrong password, please try again", 401);
    return next(error);
  }

  res.status(200).json({
    message: `logged in with ${email}`,
    userInfo: existingUser.toObject({ getters: true }),
  });
};

const editUser = async (req, res, next) => {
  const errors = validationResult(req);
  console.log("reached signup");
  console.log("req ", req);
  console.log("errors ", errors);

  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );
  }
  const userId = req.params.uid;
  console.log("req.bdoy ", req.body);
  const {
    firstName,
    lastName,
    email,
    password,
    // profileImage,
    // favorites,
    // hallId,
    // booking,
  } = req.body;

  let user;
  try {
    user = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Could not update profile, please try again",
      500
    );
    return next(error);
  }

  user.firstName = firstName;
  user.lastName = lastName;
  // if (req.file && req.file.path) {
  //   user.profileImage = req.file.path;
  // }
  console.log("user ", user);

  try {
    await user.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update profile ",
      500
    );
    return next(error);
  }

  res.status(200).json({
    user: user.toObject({ getters: true }),
    message: "Profile Updated!",
  });
};

const addImage = async (req, res, next) => {
  const userId = req.params.uid;

  console.log("req.file ", req.file);

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      "Could not update profile, please try again",
      500
    );
    return next(error);
  }
  user.profileImage = req.file.path;

  try {
    await user.save();
  } catch (err) {
    const error = new HttpError(
      "Could not update profile, please try again",
      500
    );
    return next(error);
  }

  res.json({ message: "Image uploaded successfully" });
};

module.exports = { signup, login, editUser, addImage };
