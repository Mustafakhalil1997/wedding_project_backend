const { validationResult } = require("express-validator");
const Hall = require("../models/hall");
const User = require("../models/user");
const HttpError = require("../models/http-error");
const mongoose = require("mongoose");
const hall = require("../models/hall");

const createBooking = async (req, res, next) => {
  console.log(req.body);
  res.json({ message: "Hall booked" });
};

module.exports = { createBooking };
