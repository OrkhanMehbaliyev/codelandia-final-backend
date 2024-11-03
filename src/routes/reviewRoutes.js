const express = require("express");
const {
  getReviewsByProduct,
  addReview,
} = require("../controllers/reviewController");
const router = express.Router();
router.route("/:product_id").get(getReviewsByProduct);
router.route("/").post(addReview);

module.exports = router;
