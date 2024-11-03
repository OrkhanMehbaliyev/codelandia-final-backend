const express = require("express");
const {
  getOneCart,
  getAllCarts,
  getCartByUserId,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
} = require("../controllers/cartController");
const router = express.Router();
router
  .route("/")
  .get(getAllCarts)
  .put(updateCartItemQuantity)
  .delete(clearCart);
router.route("/:id").get(getOneCart).delete(removeCartItem);
router.route("/user/:user_id").get(getCartByUserId);
router.route("/add-item").post(addItemToCart);
module.exports = router;
