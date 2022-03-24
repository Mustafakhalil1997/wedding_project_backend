const express = require("express");
const { check } = require("express-validator");
const {
  signup,
  login,
  editUser,
  addImage,
} = require("../controllers/user-controller");
const fileUpload = require("../middleware/file-upload");

const router = express.Router();

router.get("/", (req, res, next) => {
  res.json({ mssg: "This is user route, it works" });
});

router.post(
  "/signup",
  [
    check("firstName").not().isEmpty(),
    check("email").normalizeEmail({ gmail_remove_dots: false }).isEmail(),
    // check("profileImage").not().isEmpty(),
    check("password").isLength({ min: 7 }),
  ],
  signup
);

router.post(
  "/login",
  [check("email").normalizeEmail({ gmail_remove_dots: false }).isEmail()],
  login
);

router.patch("/:uid/addImage", fileUpload.single("profileImage"), addImage);

router.patch(
  "/:uid",
  [
    check("firstName").not().isEmpty(),
    check("lastName").not().isEmpty(),
    check("email").normalizeEmail({ gmail_remove_dots: false }).isEmail(),
  ],
  editUser
);

// router.get("/", (req, res, next) => {});

module.exports = router;
