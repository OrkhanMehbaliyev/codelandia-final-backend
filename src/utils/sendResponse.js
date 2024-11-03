const sendResponse = (
  res,
  data,
  statusCode = 200,
  message = null,
  customCount
) => {
  let status = "success";
  const count = customCount
    ? customCount
    : Array.isArray(data)
    ? data.length
    : null;
  if (
    String(statusCode).startsWith("4") ||
    String(statusCode).startsWith("5")
  ) {
    status = "error";
    return res.status(statusCode).json({ message: message });
  }

  return res.status(statusCode).json({
    status,
    count,
    data,
    message,
  });
};
module.exports = sendResponse;
