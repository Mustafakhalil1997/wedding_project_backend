const errorHandler = require("./errorHandler");

const promiseHandler = (controller, configs) => async (req, res, next) => {
  try {
    await controller(req, res, next);
  } catch (error) {
    errorHandler(configs.errors, error, next);
  }
};

module.exports = promiseHandler;
