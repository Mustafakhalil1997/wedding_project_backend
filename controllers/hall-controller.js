const { validationResult } = require("express-validator");
const Hall = require("../models/hall");
const User = require("../models/user");
const HttpError = require("../models/http-error");
const mongoose = require("mongoose");

const createHall = async (req, res, next) => {
  const { ownerId, hallName, email, address, location, images } = req.body;

  console.log("req.body ", req.body);

  const createdHall = new Hall({
    hallName,
    email,
    address,
    location,
    images: [],
    bookings: [],
    ownerId: ownerId,
  });

  let user;

  try {
    console.log("searching for user");
    user = await User.findById(ownerId);
  } catch (err) {
    console.log("errorr");
    const error = new HttpError(
      "Creating Hall failed while searching for owner, please try again.",
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find user for provided id.", 404);
    return next(error);
  }

  console.log("user ", user);

  try {
    console.log("creating hall");
    const sess = await mongoose.startSession();
    console.log("created session");
    sess.startTransaction();
    await createdHall.save({ session: sess });
    console.log("hall created, going to next step");
    user.hallId = createdHall; // this is supposed to add the id of the createdHall
    console.log("user.hallId ", user.hallId);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Creating Hall failed, please try againn.",
      500
    );
    return next(error);
  }

  res
    .status(200)
    .json({
      message: "Hall Created",
      hall: createdHall.toObject({ getters: true }),
    });
};

const findHallByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let hall;
  try {
    hall = await Hall.findOne({ ownerId: userId });
  } catch (err) {
    const error = new HttpError("Could not find hall, please try again", 500);
    return next(error);
  }
  res
    .status(200)
    .json({ message: "found hall", hall: hall.toObject({ getters: true }) });
};

module.exports = { createHall, findHallByUserId };
