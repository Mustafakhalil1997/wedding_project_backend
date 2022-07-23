const HttpError = require("../models/http-error");
const mongoose = require("mongoose");

const Hall = require("../models/hall");
const User = require("../models/user");
const ChatRoom = require("../models/chat");

const getUserChats = async (req, res, next) => {
  console.log(typeof JSON.parse(req.params.ids));

  console.log("getting user chats");
  const convertedIds = JSON.parse(req.params.ids).map((id) =>
    mongoose.Types.ObjectId(id)
  );

  let chatRooms;
  try {
    chatRooms = await ChatRoom.find({ _id: convertedIds })
      .sort([["chats.time", -1]]) // sort isn't working
      // .populate("userId", "firstName lastName profileImage")
      .populate({
        path: "hallId",
        select: {
          hallName: 1,
          images: { $slice: ["$images", 1] },
        },
      });
  } catch (err) {
    console.log(err);
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

  console.log("room ", chatRooms[0]);

  res.status(200).json({ message: "received", chats: chatRooms });
};

const getHallChats = async (req, res, next) => {
  console.log(typeof JSON.parse(req.params.ids));
  console.log("getting hall chats");
  const convertedIds = JSON.parse(req.params.ids).map((id) =>
    mongoose.Types.ObjectId(id)
  );

  let chatRooms;
  try {
    chatRooms = await ChatRoom.find({ _id: convertedIds })
      .sort([["chats.time", -1]]) // sort isn't working
      // .populate("userId", "firstName lastName profileImage")
      .populate("userId", "firstName lastName profileImage");
  } catch (err) {
    console.log(err);
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

  console.log("room ", chatRooms[0]);

  res.status(200).json({ message: "received", chats: chatRooms });
};

const createChat = async (req, res, next) => {
  const { firstMessage, userId, hallId } = req.body;

  const chatRoom = new ChatRoom({
    chats: [firstMessage],
    userId: userId,
    hallId: hallId,
  });

  console.log("createdChatRoom ", chatRoom);

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    console.log("err ", err);
    const error = new HttpError("Something went wrong", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find user to send the message", 404);
    return next(error);
  }

  let hall;
  try {
    hall = await Hall.findById(hallId);
  } catch (err) {
    console.log("err ", err);
    const error = new HttpError("Something went wrong ", 500);
    return next(error);
  }

  if (!hall) {
    const error = new HttpError("Could not find hall to send the message", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await chatRoom.save({ session: sess });
    user.chatRooms.push(chatRoom);
    hall.chatRooms.push(chatRoom);
    await user.save({ session: sess });
    await hall.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log("err ", err);
  }

  console.log("user ", user);
  console.log("hall ", hall);
  console.log("chatRoom after updating ", chatRoom);

  console.log("populating chatRoom hallId");

  const newChatRoom = await chatRoom.populate({
    path: "hallId",
    select: {
      hallName: 1,
      images: { $slice: ["$images", 1] },
    },
  });

  res
    .status(200)
    .json({ chatRoom: newChatRoom, user: user.toObject({ getters: true }) });
};

const sendMessage = async (req, res, next) => {
  const { roomId, newMessage } = req.body;

  console.log(roomId);
  console.log("newMessage ", newMessage);

  let chatRoom;
  try {
    chatRoom = await ChatRoom.findById(roomId);
  } catch (err) {
    console.log(err);
    const error = new HttpError("Something went wrong", 500);
    return next(error);
  }

  if (!chatRoom) {
    const error = new HttpError("chat room doesn't exist", 404);
    return next(error);
  }

  console.log(chatRoom);

  chatRoom.chats.unshift(newMessage);

  console.log(chatRoom.chats);

  try {
    await chatRoom.save();
  } catch (err) {
    console.log(err);
  }

  res.json({ message: "message received" });
};

///////////

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

module.exports = {
  getChats,
  getUserChats,
  getHallChats,
  sendMessage,
  createChat,
};
