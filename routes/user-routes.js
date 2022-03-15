const express = require("express");
const { validationResult, check } = require("express-validator");
const { signup, login } = require("../controllers/user-controller");
const HttpError = require("../models/http-error");

const router = express.Router();

router.get("/", (req, res, next) => {
  res.json({ mssg: "This is user route, it works" });
});

router.post(
  "/signup",
  [
    check("firstName").not().isEmpty(),
    check("lastName").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("profileImage").not().isEmpty(),
    check("password").isLength({ min: 7 }),
  ],
  signup
);

router.post("/login", login);

// router.get("/", (req, res, next) => {});

module.exports = router;
