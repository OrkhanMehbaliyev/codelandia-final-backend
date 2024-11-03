const express = require("express");
const {
  getOneWishlist,
  getAllWishlists,
  getWishlistByUserId,
  addItemToWishlist,
  clearWishlist,
  removeWishlistItem,
} = require("../controllers/wishlistController");
const router = express.Router();
router.route("/").get(getAllWishlists).delete(clearWishlist);
router.route("/:id").get(getOneWishlist);
router.route("/user/:user_id").get(getWishlistByUserId);
router.route("/add-item").post(addItemToWishlist);
router.route("/delete-item").delete(removeWishlistItem);
module.exports = router;
