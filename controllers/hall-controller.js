const { validationResult } = require("express-validator");
const Hall = require("../models/hall");
const User = require("../models/user");
const HttpError = require("../models/http-error");
const mongoose = require("mongoose");
const { cloudinary } = require("../helpers/cloudinary");
const { fillData } = require("../helpers/fillRandomData");

const getHalls = async (req, res, next) => {
  const count = req.params.count;
  let filters = req.params.filters;

  console.log("count ", count);
  console.log("filter ", filters);
  // console.log(filters[0]);
  if (!filters) filters = [];

  let priceRange;
  if (filters.includes(1)) priceRange = { $lte: 10 };
  if (filters.includes(2))
    priceRange = priceRange ? { $lte: 20 } : { $gte: 10, $lte: 20 };
  if (filters.includes(3))
    priceRange = priceRange ? { $lte: 30 } : { $gte: 20 };

  let halls;
  try {
    if (priceRange)
      halls = await Hall.find({ price: priceRange })
        .populate("bookings")
        .skip(10 * (count - 1))
        .limit(10);
    else
      halls = await Hall.find()
        .populate("bookings")
        .skip(10 * (count - 1))
        .limit(10);

    if (!halls) {
      const error = new HttpError("Could not find halls", 404);
      return next(error);
    }

    console.log("halls ", halls);

    const newHalls = halls.map((hall) => {
      return hall.toObject({ getters: true });
    });

    res.json({ halls: newHalls });
  } catch (err) {
    const error = new HttpError("Could not get halls", 500);
    return next(error);
  }
};

const getHall = async (req, res, next) => {
  const { hallId } = req.body;

  let hall;
  try {
    hall = await Hall.findById(hallId).populate("bookings");
  } catch (err) {
    const error = new HttpError("Could not get venue, please try again", 500);
    return next(error);
  }

  if (!hall) {
    const error = new HttpError("Venue doesn't exist", 404);
    return next(error);
  }

  res
    .status(200)
    .json({ message: "Found venue", hall: hall.toObject({ getters: true }) });
};

const createHall = async (req, res, next) => {
  const { ownerId, hallName, email, address, location, mobileNumber, price } =
    req.body;

  console.log("req.body ", req.body);
  console.log("creating hall");
  const createdHall = new Hall({
    hallName,
    email,
    address,
    mobileNumber,
    price,
    location,
    images: [],
    bookings: [],
    ownerId: ownerId,
    chatRooms: [],
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

  res.status(200).json({
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

const addImage = async (req, res, next) => {
  const hallId = req.params.uid;

  console.log("req.file ", req.file);

  let uploadedFile;
  try {
    uploadedFile = await cloudinary.uploader.upload(req.file.path, {
      folder: "images",
    });
  } catch (err) {
    console.log("err ", err.message);
    const error = new HttpError("Failed to upload to cloudinary ", 500);
    return next(error);
  }

  const { public_id } = uploadedFile;

  let hall;
  try {
    hall = await Hall.findById(hallId).populate("bookings");
  } catch (err) {
    const error = new HttpError(
      "Could not update profile, please try again",
      500
    );
    return next(error);
  }
  hall.images.push(public_id);
  // hall.profileImage = req.file.path;

  try {
    await hall.save();
  } catch (err) {
    const error = new HttpError(
      "Could not update profile, please try again",
      500
    );
    return next(error);
  }

  res.status(200).json({
    message: "Image uploaded successfully",
    newHallInfo: hall.toObject({ getters: true }),
    newImage: public_id,
  });
};

const deleteImages = async (req, res, next) => {
  const deleteIds = req.body;
  const hallId = req.params.hid;

  let hall;
  try {
    hall = await Hall.findById(hallId).populate("bookings");
  } catch (err) {
    console.log("err ", err);
    const error = new HttpError("Could not delete", 500);
    return next(error);
  }

  if (!hall) {
    const error = new HttpError(
      "Could not delete images, please try again ",
      404
    );
    return next(error);
  }

  let newImages = hall.images.filter((image) => !deleteIds.includes(image));

  hall.images = newImages;

  try {
    await hall.save();
  } catch (err) {
    const error = new HttpError(
      "Could not delete images, please try again",
      500
    );
    return next(error);
  }

  // try {
  //   await cloudinary.uploader.destroy(deleteIds);
  // } catch (err) {
  //   console.log("err ", err);
  // }

  res.status(200).json({
    message: "Photos deleted",
    updatedHall: hall.toObject({ getters: true }),
  });
};

// fillData()

module.exports = {
  createHall,
  findHallByUserId,
  addImage,
  getHalls,
  deleteImages,
};
