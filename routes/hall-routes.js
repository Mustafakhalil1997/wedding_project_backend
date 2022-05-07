const express = require("express");
const { check } = require("express-validator");
const fileUpload = require("../middleware/file-upload");
const checkAuth = require("../middleware/check-auth");

const {
  createHall,
  findHallByUserId,
  addImage,
  getHalls,
} = require("../controllers/hall-controller");
const router = express.Router();

// router.get("/", (req, res, next) => {
//   res.json({ message: "This is hall route, it works" });
// });

// router.use(checkAuth);

router.get("/", getHalls);

router.post("/createHall", createHall);

router.get("/halls/:uid", findHallByUserId);

router.patch("/addImage/:uid", fileUpload.single("profileImage"), addImage);

// router.get("/", (req, res, next) => {});

module.exports = router;
