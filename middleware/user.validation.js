const { check } = require("express-validator");

const signupValidation = [
  check("firstName").not().isEmpty(),
  check("email").normalizeEmail({ gmail_remove_dots: false }).isEmail(),
  // check("profileImage").not().isEmpty(),
  check("password").isLength({ min: 7 }),
];

const loginValidation = [check("email").normalizeEmail({ gmail_remove_dots: false }).isEmail()];

const editValidation = [
  check("firstName").not().isEmpty(),
  check("email").normalizeEmail({ gmail_remove_dots: false }).isEmail(),
];

module.exports = { signupValidation, loginValidation, editValidation };
