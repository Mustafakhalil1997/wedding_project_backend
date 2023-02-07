const errorMiddleware = require("./errorMiddleware");

const promiseHandler = (controller, configs) => async (req, res, next) => {
  try {
    await controller(req, res, next);
  } catch (error) {
    errorMiddleware(configs.errors, error, next);
  }
};

module.exports = promiseHandler;
