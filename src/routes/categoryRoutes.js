const express = require("express");
const {
  getAllCategories,
  getOneCategory,
  createCategory,
  updateCategory,
} = require("../controllers/categoryController");

const router = express.Router();
const multer = require("multer");
const catchAsync = require("../utils/catchAsync");
const uploadImage = require("../middleware/uploadImage");
const deleteImage = require("../middleware/deleteImage");
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true); // Accept file
  } else {
    cb(new Error("Only .jpg and .png images are allowed!"), false); // Reject file
  }
};

const upload = multer({ fileFilter, storage });

router
  .route("/")
  .get(getAllCategories)
  .post(upload.single("image"), uploadImage("category_bucket"), createCategory);
router
  .route("/:id")
  .get(getOneCategory)
  .put(
    upload.single("image"),
    deleteImage("categories", "category_id", "category_bucket"),
    uploadImage("category_bucket"),
    updateCategory
  );
module.exports = router;
