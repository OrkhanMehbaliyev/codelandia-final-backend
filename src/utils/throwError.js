const throwError = (res, message, statusCode = 400) => {
  return res.status(statusCode).json(message);
};
module.exports = { throwError };
