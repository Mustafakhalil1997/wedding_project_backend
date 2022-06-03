const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const chatRoomSchema = new Schema({
  userId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  hallId: { type: mongoose.Types.ObjectId, required: true, ref: "Hall" },
  // contacts: [{ type: mongoose.Types.ObjectId, required: true, ref: "User" }],
  chats: [
    {
      senderId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
      receiverId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "User",
      },
      //   senderName: { type: String, required: true },
      //   receiverName: { type: String, required: true },
      message: { type: String, required: true },
      time: { type: Date, required: true },
    },
  ],
});

module.exports = mongoose.model("ChatRoom", chatRoomSchema); // this will later be the name of the collection in the database( but with lowercase and plural)
