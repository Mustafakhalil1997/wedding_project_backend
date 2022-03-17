const { validationResult } = require("express-validator");
const Hall = require("../models/hall");
const HttpError = require("../models/http-error");

const createHall = async (req, res, next) => {
  const { userId, hallName, email, address, location, images } = req.body;

  const createdHall = new Hall({
    hallName,
    email,
    address,
    location,
    images,
    bookings: [],
    ownerId: userId,
  });

  await createdHall.save();

  res.json({ message: "Hall edited" });
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
