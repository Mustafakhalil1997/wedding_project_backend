const express = require("express");
const { check } = require("express-validator");
const fileUpload = require("../middleware/file-upload");
const checkAuth = require("../middleware/check-auth");

const {
  getChats,
  getAllChats,
  sendMessage,
  createChat,
} = require("../controllers/chatRoom-controller");

const router = express.Router();

router.get("/:ids", getAllChats);

router.get("/:roomId", getChats);

router.post("/createChat", createChat);

router.patch("/sendMessage", sendMessage);

module.exports = router;
