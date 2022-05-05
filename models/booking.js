const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  userId: { type: mongoose.Types.ObjectId, ref: "User" },
  hallId: { type: mongoose.Types.ObjectId, ref: "Hall" },
  date: { type: Date, required: true },
});

module.exports = mongoose.model("Booking", bookingSchema); // this will later be the name of the collection in the database( but with lowercase and plural)
