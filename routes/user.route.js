const express = require("express");
const { check } = require("express-validator");
const {
  signup,
  login,
  editUser,
  addImage,
  addFavoriteHall,
  getUsersByIds,
  forgotPassword,
  changePassword,
} = require("../controllers/user.controller");
const {
  signupValidation,
  loginValidation,
  editValidation,
} = require("../middleware/user.validation");
const checkAuth = require("../middleware/check-auth");
const fileUpload = require("../middleware/file-upload");

const router = express.Router();

router.get("/", (req, res, next) => {
  res.json({ mssg: "This is user route, it works" });
});

router.post("/signup", signupValidation, signup);
router.post("/login", loginValidation, login);
router.patch("/forgotPassword", forgotPassword);

router.use(checkAuth);

router.post("/users", getUsersByIds);
router.patch("/addFavorite", addFavoriteHall);
router.patch("/addImage/:uid", fileUpload.single("profileImage"), addImage);
router.patch("/changePassword/:uid", changePassword);
router.patch("/edit/:uid", editValidation, editUser);

// router.get("/", (req, res, next) => {});

module.exports = router;
