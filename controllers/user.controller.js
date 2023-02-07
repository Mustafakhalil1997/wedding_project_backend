const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const { cloudinary } = require("../helpers/cloudinary");
const {
  handleValidationErrors,
  doesUserExist,
  generateHashedPassword,
  saveUser,
  generateToken,
  createUser,
} = require("../helpers/user.service");

const configs = require("../helpers/user.config");

const User = require("../models/user");
const promiseHandler = require("../lib/promiseHandler");

const signup = promiseHandler(async (req, res, next) => {
  const { email, password } = req.body;

  handleValidationErrors(req);
  await doesUserExist(email);
  const hashedPassword = await generateHashedPassword(password);
  const createdUser = createUser(req, hashedPassword);
  await saveUser(createdUser);
  const token = generateToken();

  res.status(200).json({
    userInfo: createdUser.toObject({ getters: true }),
    token: token,
    message: "signed up",
  });
}, configs);

/////////////////////

const fetchUser = async () => {
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
    return existingUser;
  } catch (err) {
    const error = new HttpError("Logging in failed, please try again later", 500);
    throw error;
  }
};

const arePasswordsIdentical = async (receivedPassword, actualPassword) => {
  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(receivedPassword, actualPassword);
  } catch (err) {
    const error = new HttpError("Could not log you in, please try again", 500);
    throw error;
  }

  if (!isValidPassword) {
    const error = new HttpError("Wrong password, please try again", 401);
    throw error;
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  let token;
  try {
    await checkIfUserExists(email);
    existingUser = await fetchUser(email);
    await arePasswordsIdentical(password, existingUser.password);
    token = generateToken();
  } catch (error) {
    return next(error);
  }

  res.status(200).json({
    message: `logged in with ${email}`,
    userInfo: existingUser.toObject({ getters: true }),
    hallInfo: existingUser.hallId ? existingUser.hallId.toObject({ getters: true }) : null,
    token: token,
  });
};

////////////////////////////

const GMAIL_PASS = process.env.GMAIL_PASS;
// testing
const forgotPassword = async (req, res, next) => {
  try {
    let testAccount = await nodemailer.createTestAccount();

    console.log("sending request");
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      // service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: "mustafakh1997@gmail.com", // generated ethereal user
        pass: GMAIL_PASS, // generated ethereal password
      },
    });

    console.log("sending request");

    const details = {
      from: "mustafakh1997@gmail.com", // sender address
      to: "mustafa.khalil@lau.edu, m.khalil9752@gmail.com, shifaa.khalil@outlook.com", // list of receivers
      subject: "Hello ✔", // Subject line
      text: "Hello world?", // plain text body
      html: "<b>Hello world?</b>", // html body
    };

    const info = await transporter.sendMail(details);

    console.log("info", info.messageId);
    res.status(200).json({ message: "Password changed" });
  } catch (err) {
    console.log(err);
  }
};

const editUser = async (req, res, next) => {
  const errors = validationResult(req);
  console.log("reached signup");
  console.log("errors ", errors);

  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs passed, please check your data", 422));
  }
  const userId = req.params.uid;
  console.log("req.bdoy ", req.body);
  const {
    firstName,
    lastName,
    email,
    // profileImage,
    // favorites,
    // hallId,
    // booking,
  } = req.body;

  let user;
  try {
    user = await User.findOne({ email: email })
      .populate("reservation")
      .populate({
        path: "hallId",
        populate: {
          path: "bookings",
          model: "Booking",
        },
      });
  } catch (err) {
    const error = new HttpError("Could not update profile, please try again", 500);
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
    const error = new HttpError("Something went wrong, could not update profile ", 500);
    return next(error);
  }

  const newData = {
    firstName,
    lastName,
    profileImage: user.profileImage,
  };

  res.status(200).json({
    user: newData,
    message: "Profile Updated!",
  });
};

const addImage = async (req, res, next) => {
  const userId = req.params.uid;

  console.log("req.file ", req.file);
  let uploadedFile;
  try {
    uploadedFile = await cloudinary.uploader.upload(req.file.path, {
      folder: "images",
    });
  } catch (err) {
    console.log("err ", err);
    const error = new HttpError("Failed to upload to cloudinary ", 500);
    return next(error);
  }

  const { public_id } = uploadedFile;

  console.log("uploadedFile ", uploadedFile);

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError("Could not update profile, please try again", 500);
    return next(error);
  }
  user.profileImage = public_id;

  try {
    await user.save();
  } catch (err) {
    const error = new HttpError("Could not update profile, please try again", 500);
    return next(error);
  }

  res.json({ message: "Image uploaded successfully" });
};

const addFavoriteHall = async (req, res, next) => {
  const { userId, hallId } = req.body;

  let user;
  try {
    console.log("attempting to add favorite");
    user = await User.findById(userId);
    console.log("found user ", user);
  } catch (err) {
    const error = new HttpError("Could not add favorite, please try again", 500);
    return next(error);
  }

  const index = user.favorites.findIndex((id) => id.toString() === hallId);
  console.log("index ", index);
  if (index < 0) {
    const newHallId = mongoose.Types.ObjectId(hallId);
    console.log("newHallId ", newHallId);
    user.favorites.push(newHallId);
  } else {
    const newFavorites = user.favorites.filter((id) => id.toString() !== hallId);
    console.log("newFavoritess ", newFavorites);
    user.favorites = newFavorites;
  }

  console.log("updated user ", user);
  try {
    await user.save();
    console.log("updated user favorites");
  } catch (err) {
    console.log("error ", err);
    const error = new HttpError("Could not add favorite", 500);
    return next(error);
  }

  res.status(200).json({ message: "Favorite added" });
};

const changePassword = async (req, res, next) => {
  const userId = req.params.uid;

  const { currentPassword, newPassword, confirmPassword } = req.body;
  console.log(currentPassword, newPassword, confirmPassword);

  let existingUser;
  try {
    existingUser = await User.findById(userId);
  } catch (err) {
    const error = new HttpError("Something went wrong, Please try again", 500);
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError("Could not find user, Please try again", 404);
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(currentPassword, existingUser.password);
  } catch (err) {
    const error = new HttpError("Something went wrong, please try again", 500);
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError("Wrong password, please try again", 401);
    return next(error);
  }

  existingUser.password = newPassword;

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(newPassword, 12); // 12 salting rounds
  } catch (err) {
    const error = new HttpError("Could not create user, please try again.", 500);
    return next(error);
  }

  existingUser.password = hashedPassword;

  try {
    existingUser.save();
  } catch (err) {
    const error = new HttpError("Something Went Wrong, Could not change Password", 500);
    return next(error);
  }

  res.status(200).json({ message: "Password Changed" });
};

const getUsersByIds = async (req, res, next) => {
  const userIds = req.body;

  console.log("userIds ", userIds);
  let users;
  try {
    users = await User.find({ _id: userIds });
    console.log("users ", users);
    users = users.map((user) => {
      const newUser = user.toObject({ getters: true });
      const { id, firstName, lastName, email } = newUser;
      return { id, firstName, lastName, email };
    });

    console.log("users again ", users);
  } catch (err) {
    console.log("err ", err);
    const error = new HttpError("Could not get users ", 500);
    return next(error);
  }

  if (!users) {
    const error = new HttpError("Could not find users ", 404);
    return next(error);
  }

  res.status(200).json({ users: users });
};

module.exports = {
  signup,
  login,
  editUser,
  addImage,
  addFavoriteHall,
  getUsersByIds,
  changePassword,
  forgotPassword,
};
