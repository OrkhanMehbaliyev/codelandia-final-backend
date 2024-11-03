const catchAsync = require("../utils/catchAsync");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const supabase = require("../supabase");
const sendResponse = require("../utils/sendResponse");
const { raw } = require("body-parser");
const { throwError } = require("../utils/throwError");
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !user) return throwError(res, "Invalid email or password");

  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) return throwError(res, "Invalid email or password");

  const token = jwt.sign(
    {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );
  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 3600000,
  });
  res.json({
    username: user.username,
    email: user.email,
    role: user.role,
    user_id: user.user_id,
  });
});

const signup = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;

  const password_hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from("users")
    .insert([{ username, email, passwordHash: password_hash }]);

  if (error) return throwError(res, error.message);

  return sendResponse(res, data, 201, "success", "Signed up successfully.");
});

const checkAuthentication = catchAsync(async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ error: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return throwError(res, "Invalid token");
    req.user = decoded;

    if (req.user.role !== "admin") {
      return throwError("Access denied");
    }

    return res.status(200).json({
      isAuthorized: true,
    });
  });
});

const checkIsLoggedIn = catchAsync(async (req, res, next) => {
  const token = req.cookies.token;

  if (!token)
    return res
      .status(200)
      .json({ message: "No token provided", isLoggedIn: false });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err)
      return res
        .status(200)
        .json({ message: "Invalid token", isLoggedIn: false });

    req.user = decoded;
    console.log(req.user);
    const returnData = {
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      user_id: req.user.user_id,
      isLoggedIn: true,
    };

    return sendResponse(res, returnData, 200);
  });
});

const logout = catchAsync(async (req, res, next) => {
  res.clearCookie("token", {
    httpOnly: true,
  });

  return res.status(200).json({
    message: "logout is successfull.",
  });
});

module.exports = {
  login,
  signup,
  checkAuthentication,
  logout,
  checkIsLoggedIn,
};
