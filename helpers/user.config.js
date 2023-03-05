const errors = {
  serverError: {
    key: "ServerError",
    code: 500,
    message: { en: "Something went wrong, please try again" },
  },
  notFound: {
    key: "NotFound",
    code: 404,
    message: { en: "User does not exist" },
  },
  verified: {
    key: "Verified",
    code: 400,
    message: { en: "Account already verified" },
  },
  userExists: {
    key: "UserExists",
    code: 400,
    message: { en: "User already exists, try logging in" },
  },
  tokenExpired: {
    key: "TokenExpired",
    code: 400,
    message: { en: "Your token has expired" },
  },
  invalidToken: {
    key: "InvalidToken",
    code: 400,
    message: { en: "Your token is invalid" },
  },
  invalidData: {
    key: "InvalidData",
    code: 422,
    message: {
      en: "Invalid inputs passed, please check your data",
    },
  },
  tokenRedeemed: {
    key: "TokenRedeemed",
    code: 400,
    message: { en: "Your token has already been redeemed" },
  },
  passwordsNotEqual: {
    key: "PasswordNotEqual",
    code: 400,
    message: { en: "Password and Confirm Password are not equal" },
  },
  emailFailed: {
    key: "EmailFailed",
    code: 500,
    message: { en: "Failed to send email" },
  },

  wrongCredentials: {
    key: "WrongCredentials",
    code: 400,
    message: { en: "Wrong Credentials Provided" },
  },
};

module.exports = { errors };
