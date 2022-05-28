const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  profileImage: { type: String },
  favorites: [{ type: mongoose.Types.ObjectId, ref: "Hall" }],
  hallId: { type: mongoose.Types.ObjectId, ref: "Hall" },
  reservation: { type: mongoose.Types.ObjectId, ref: "Booking" },
  chatRooms: [{ type: mongoose.Types.ObjectId, ref: "ChatRoom" }],
});

module.exports = mongoose.model("User", userSchema);
