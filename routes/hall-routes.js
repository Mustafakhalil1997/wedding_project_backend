const express = require("express");
const { check } = require("express-validator");
const {
  createHall,
  findHallByUserId,
} = require("../controllers/hall-controller");
const router = express.Router();

router.get("/", (req, res, next) => {
  res.json({ message: "This is user route, it works" });
});

router.post("/createHall", createHall);

router.get("/halls/:uid", findHallByUserId);

// router.get("/", (req, res, next) => {});

module.exports = router;
