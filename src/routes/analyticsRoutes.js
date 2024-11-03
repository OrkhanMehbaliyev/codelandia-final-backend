const express = require("express");

const {
  getCounts,
  getTotalSalesByCategory,
  getMostSoldProducts,
} = require("../controllers/analyticsController");
const router = express.Router();
router.route("/count").get(getCounts);
router.route("/category-sales").get(getTotalSalesByCategory);
router.route("/product-sales").get(getMostSoldProducts);
module.exports = router;
