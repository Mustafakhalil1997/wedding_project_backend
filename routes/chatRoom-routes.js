const express = require("express");
const { check } = require("express-validator");
const fileUpload = require("../middleware/file-upload");
const checkAuth = require("../middleware/check-auth");

const {
  getChats,
  getUserChats,
  getHallChats,
  sendMessage,
  createChat,
} = require("../controllers/chatRoom-controller");

const router = express.Router();

router.get("/user/:ids", getUserChats);

router.get("/hall/:ids", getHallChats);

router.get("/:roomId", getChats);

router.post("/createChat", createChat);

router.patch("/sendMessage", sendMessage);

module.exports = router;
