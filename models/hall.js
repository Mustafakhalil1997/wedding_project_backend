const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const hallSchema = new Schema({
  hallName: { type: String, required: true },
  email: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  price: { type: Number, required: true }, // per person
  images: [{ type: String, required: true }],
  bookings: [{ type: mongoose.Types.ObjectId, required: true, ref: "Booking" }],
  ownerId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  chatRooms: [{ type: mongoose.Types.ObjectId, ref: "ChatRoom" }],
});

module.exports = mongoose.model("Hall", hallSchema); // this will later be the name of the collection in the database( but with lowercase and plural)
