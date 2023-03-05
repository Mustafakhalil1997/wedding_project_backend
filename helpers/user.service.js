const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const configs = require("./user.config");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const handleValidationErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new HttpError("Invalid inputs passed, please check your data", 422);
};

const doesUserExist = async (email) => {
  const existingUser = await User.findOne({ email: email });
  return existingUser;
};

const createUser = (req, hashedPassword) => {
  const { firstName, lastName, email, profileImage } = req.body;
  const createdUser = new User({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    profileImage,
    favorites: [],
    hallId: null,
    reservation: null,
    chatRooms: [],
  });
  return createdUser;
};

const generateHashedPassword = async (password) => {
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12); // 12 salting rounds
    return hashedPassword;
  } catch (err) {
    throw new HttpError("Could not create user, please try again.", 500);
  }
};

const saveUser = async (user) => {
  try {
    await user.save();
  } catch (err) {
    throw new HttpError("Signing up failed, please try again.", 500);
  }
};

const generateToken = async (createdUser) => {
  try {
    return jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      "super_secret_dont_share",
      { expiresIn: "1h" }
    );
  } catch (err) {
    console.log("err", err);
    throw new HttpError("Signing up failed, please try again.", 500);
  }
};

const fetchUser = async (email) => {
  try {
    const existingUser = await User.findOne({ email: email })
      .populate("reservation")
      .populate({
        path: "hallId",
        populate: {
          path: "bookings",
          model: "Booking",
        },
      });
    console.log("hereee", existingUser);
    if (!existingUser) throw new Error(configs.errors.notFound.key);
    return existingUser;
  } catch (err) {
    console.log("err", err);
    throw new Error(configs.errors.serverError.key);
  }
};

const arePasswordsIdentical = async (receivedPassword, actualPassword) => {
  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(receivedPassword, actualPassword);
  } catch (err) {
    console.log("error", err);
    const error = new HttpError("Could not log you in, please try again", 500);
    throw error;
  }

  if (!isValidPassword) {
    const error = new HttpError("Wrong password, please try again", 401);
    throw error;
  }
};

module.exports = {
  handleValidationErrors,
  doesUserExist,
  generateHashedPassword,
  saveUser,
  createUser,
  generateToken,
  fetchUser,
  arePasswordsIdentical,
};
