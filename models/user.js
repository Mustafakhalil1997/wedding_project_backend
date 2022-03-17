const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  profileImage: { type: String },
  favorites: [{ type: mongoose.Types.ObjectId }],
  hallId: { type: mongoose.Types.ObjectId },
  reservation: { type: mongoose.Types.ObjectId },
});

module.exports = mongoose.model("User", userSchema);
