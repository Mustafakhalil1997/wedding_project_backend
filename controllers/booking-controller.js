const HttpError = require("../models/http-error");
const mongoose = require("mongoose");

const { validationResult } = require("express-validator");

const Hall = require("../models/hall");
const User = require("../models/user");
const Booking = require("../models/booking");

const createBooking = async (req, res, next) => {
  console.log(req.body);

  const { hallId, userId, date } = req.body;

  let user;
  let hall;
  try {
    user = await User.findById(userId);
    hall = await Hall.findById(hallId);
  } catch (err) {
    const error = new HttpError(
      "Could not create booking, while looking for user and hall",
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not creat booking, user not found", 404);
    return next(error);
  }

  if (user.reservation) {
    console.log("you already have a reservation");
    const error = new HttpError(
      "Cannot reserve, you already have a reservation"
    );
    return next(error);
  }

  console.log("user found");

  const createdBooking = new Booking({
    userId,
    hallId,
    date,
  });

  try {
    console.log("creating reservation");
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdBooking.save({ session: sess });
    console.log("booking saved");

    hall.bookings.push(createdBooking); // this should add the id of the created booking
    console.log("hall ", hall);
    user.reservation = createdBooking;
    console.log("user ", user);
    await hall.save({ session: sess });
    console.log("saved hall");
    await user.save({ session: sess });
    console.log("saved");
    await sess.commitTransaction();
  } catch (err) {
    console.log("failed to reserve ", err);
    const error = new HttpError(
      "creating booking failed, please try again",
      500
    );
    return next(error);
  }

  res.status(200).json({
    message: "Hall booked",
    userInfo: user.toObject({ getters: true }),
  });
};

module.exports = { createBooking };
