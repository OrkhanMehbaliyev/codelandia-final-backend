const express = require("express");
const {
  getOrdersByUserId,
  addOrder,
  getAllOrders,
  updateOrder,
  deleteOrder,
} = require("../controllers/orderController");
const router = express.Router();
router.route("/add-order").post(addOrder);

router.route("/user/:user_id").get(getOrdersByUserId);
router.route("/").get(getAllOrders);
router.route("/:order_id").put(updateOrder).delete(deleteOrder);

module.exports = router;
