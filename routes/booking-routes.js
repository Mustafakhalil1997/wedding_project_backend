const express = require("express");
const { check } = require("express-validator");
const fileUpload = require("../middleware/file-upload");
const checkAuth = require("../middleware/check-auth");

const { createBooking } = require("../controllers/booking-controller");

const router = express.Router();

// router.get("/", (req, res, next) => {
//   res.json({ message: "This is hall route, it works" });
// });

// router.use(checkAuth);

router.post("/createBooking", createBooking);

module.exports = router;
