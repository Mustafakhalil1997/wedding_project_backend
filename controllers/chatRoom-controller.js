const HttpError = require("../models/http-error");
const mongoose = require("mongoose");

const Hall = require("../models/hall");
const User = require("../models/user");
const ChatRoom = require("../models/chat");

const getAllChats = async (req, res, next) => {
  console.log(typeof JSON.parse(req.params.ids));

  const convertedIds = JSON.parse(req.params.ids).map((id) =>
    mongoose.Types.ObjectId(id)
  );

  let chatRooms;
  try {
    chatRooms = await ChatRoom.find({ _id: convertedIds });
  } catch (err) {
    console.log(err);
    const error = new HttpError("Could not fetch chat rooms", 500);
    return next(error);
  }

  if (!chatRooms) {
    console.log("no rooms");
    const error = new HttpError("No chat rooms found", 404);
    return next(error);
  }

  console.log("chatrooms ", chatRooms);

  res.json({ message: "received" });
};

const getChats = async (req, res, next) => {
  const chatRoomId = req.params.roomId;

  let chatRoom;
  try {
    chatRoom = await ChatRoom.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(chatRoomId) } },
      { $unwind: "$chats" },
      { $sort: { "chats.time": -1 } },
    ]);
    // chatRoom = await ChatRoom.findById(chatRoomId);
  } catch (err) {
    console.log(err);
  }

  if (!chatRoom) {
    const error = new HttpError("No chat room", 404);
    return next(error);
  }

  // console.log(chatRoom.chats);

  const contacts = chatRoom[0].contacts;

  const chats = chatRoom.map((chat) => {
    return chat.chats;
  });

  const contactsIds = [chats[0].sender, chats[0].receiver];

  console.log(chats);
  console.log(contacts);
  console.log(contactsIds);

  res.status(200).json({
    messages: chats,
    contacts,
    contactsIds: contactsIds,
  });
};

module.exports = { getChats, getAllChats };
