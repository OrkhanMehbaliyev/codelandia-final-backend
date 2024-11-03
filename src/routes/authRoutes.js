const express = require("express");
const {
  login,
  signup,
  checkAuthentication,
  logout,
  checkIsLoggedIn,
} = require("../controllers/authController");

const router = express.Router();
router.route("/login").post(login);
router.route("/signup").post(signup);
router.route("/check-admin").get(checkAuthentication);
router.route("/logout").get(logout);
router.route("/check-logged-in").get(checkIsLoggedIn);
module.exports = router;
