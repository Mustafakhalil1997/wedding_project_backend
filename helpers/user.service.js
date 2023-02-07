const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");

const handleValidationErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new HttpError("Invalid inputs passed, please check your data", 422);
};

const doesUserExist = async (email) => {
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    throw new HttpError("Could not sign you up, please try again", 500);
  }

  if (existingUser) throw new HttpError("User already exists, try logging in", 404);
};

const createUser = (req, hashedPassword) => {
  const { firstName, lastName, email, profileImage } = req.body;
  const createdUser = new User({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    profileImage,
    favorites: [],
    hallId: null,
    reservation: null,
    chatRooms: [],
  });
  return createdUser;
};

const generateHashedPassword = async (password) => {
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12); // 12 salting rounds
    return hashedPassword;
  } catch (err) {
    throw new HttpError("Could not create user, please try again.", 500);
  }
};

const saveUser = async (user) => {
  try {
    await user.save();
  } catch (err) {
    throw new HttpError("Signing up failed, please try again.", 500);
  }
};

const generateToken = () => {
  try {
    return jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      "super_secret_dont_share",
      { expiresIn: "1h" }
    );
  } catch (err) {
    throw new HttpError("Signing up failed, please try again.", 500);
  }
};

module.exports = {
  handleValidationErrors,
  doesUserExist,
  generateHashedPassword,
  saveUser,
  createUser,
  generateToken,
};
