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

  let existingReservation;
  try {
    existingReservation = await Booking.findOne({ hallId: hallId, date: date });
  } catch (err) {
    const error = new HttpError("Could not reserve, Try again later", 500);
    return next(error);
  }
  console.log("existingReservation ", existingReservation);
  if (existingReservation) {
    const error = new HttpError("This day is reserved, Choose another", 404);
    return next(error);
  }

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
    user.reservation = createdBooking;
    await hall.save({ session: sess });
    await user.save({ session: sess });
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

const getBookingsWithUsers = async (req, res, next) => {
  const bookingIds = req.body;

  console.log("bookingsIds ", bookingIds);
  let bookings;
  try {
    bookings = await Booking.find({ _id: bookingIds }).populate("userId");
    console.log("bookings ", bookings);
  } catch (err) {
    const error = new HttpError("Failed get bookings", 500);
    return next(error);
  }

  if (!bookings) {
    const error = new HttpError("Could not find bookings", 404);
    return next(error);
  }

  let bookingsWithUser = {};
  for (let i = 0; i < bookings.length; i++) {
    // console.log(bookings[i].date.toISOString().substring(0, 10));
    const date = bookings[i].date.toISOString().substring(0, 10);
    console.log("date ", date);
    console.log("bookings ", bookings[0].userId);
    bookingsWithUser[date] = {};
    const user = bookings[i].userId;
    bookingsWithUser[date] = user;
  }

  console.log("bookingsWithUser ", bookingsWithUser);

  res.status(200).json({ bookings: bookingsWithUser });
};

module.exports = { createBooking, getBookingsWithUsers };
