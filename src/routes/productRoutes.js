const express = require("express");
const {
  getAllProducts,
  getOneProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getPopularProducts,
  getProductsBySearch,
} = require("../controllers/productController");
const uploadImage = require("../middleware/uploadImage");

const router = express.Router();
const multer = require("multer");
const catchAsync = require("../utils/catchAsync");
const deleteImage = require("../middleware/deleteImage");
const protectRoute = require("../middleware/protectRoute");
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpg and .png images are allowed!"), false);
  }
};

const upload = multer({ fileFilter, storage });
router.route("/popular").get(getPopularProducts);
router.route("/search").get(getProductsBySearch);
router
  .route("/")
  .get(getAllProducts)
  .post(upload.single("image"), uploadImage("product_images"), createProduct);

router
  .route("/:id")
  .get(getOneProduct)
  .delete(
    deleteImage("products", "product_id", "product_images"),
    deleteProduct
  )
  .put(
    upload.single("image"),
    deleteImage("products", "product_id", "product_images"),
    uploadImage("product_images"),
    updateProduct
  );

module.exports = router;
