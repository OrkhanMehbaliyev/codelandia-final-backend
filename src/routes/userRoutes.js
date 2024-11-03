const {
  getAllUsers,
  getOneUser,
  updateUser,
} = require("../controllers/userController");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();
router.route("/").get(getAllUsers);
router.route("/:id").get(getOneUser).put(upload.none(), updateUser);
module.exports = router;
