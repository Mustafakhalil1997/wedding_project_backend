const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const hallSchema = new Schema({
  hallName: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: String, required: true },
  },
  images: [{ type: String }],
  bookings: [{ type: Date }],
  ownerId: { type: mongoose.Types.ObjectId },
});

module.exports = mongoose.model("Hall", hallSchema); // this will later be the name of the collection in the database( but with lowercase and plural)
