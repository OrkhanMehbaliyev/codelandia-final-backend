const catchAsync = require("../utils/catchAsync");
const supabase = require("../supabase");
const sendResponse = require("../utils/sendResponse");
const { throwError } = require("../utils/throwError");
const getAllCarts = catchAsync(async (req, res, next) => {
  const data = await supabase.from("carts").select("*");
  return res.status(200).json(data);
});

const getOneCart = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  if (!id) return throwError(res, "id is not valid");

  const { data, error } = await supabase
    .from("carts")
    .select("*")
    .eq("cart_id", id)
    .single();
  if (error) return throwError(res, error.message);

  return sendResponse(res, data);
});
const getCartByUserId = catchAsync(async (req, res, next) => {
  const user_id = req.params.user_id;

  if (!user_id) return throwError(res, "Id is not valid");

  const { data: cartData, error: cartError } = await supabase
    .from("carts")
    .select("*")
    .eq("user_id", user_id)
    .single();

  if (!cartData) {
    return sendResponse(res, {});
  }

  if (cartError) return throwError(res, cartError.message);
  const { data: detailedData, error: detailedError } = await supabase
    .from("cart_items")
    .select("*, products (name,product_id,price)")
    .eq("cart_id", cartData.cart_id);

  if (detailedError) return throwError(res, detailedError.message);

  const cart_items = detailedData.map((el) => ({
    cart_item_id: el.cart_item_id,
    product_id: el.products.product_id,
    product_name: el.products.name,
    product_price: el.products.price,
    quantity: el.quantity,
  }));

  const totalPrice = cart_items.reduce(
    (agg, el) => agg + Number(el.product_price) * Number(el.quantity),
    0
  );

  const refinedData = {
    cart_id: cartData.cart_id,
    createdAt: cartData.createdAt,
    cart_items: cart_items,
    total_price: totalPrice,
  };

  return sendResponse(res, refinedData);
});

const addItemToCart = catchAsync(async (req, res, next) => {
  const { user_id, product_id, quantity } = req.body;

  if (!user_id || !product_id || !quantity)
    return throwError(res, "There is missing field");

  let { data: cart, error: cartError } = await supabase
    .from("carts")
    .select("*")
    .eq("user_id", user_id)
    .single();

  if (!cart) {
    const { data: newCart, error: newCartError } = await supabase
      .from("carts")
      .insert([{ user_id }])
      .select()
      .single();

    if (newCartError) return throwError(res, newCartError.message);
    cart = newCart;
  }

  const { data: existingItem, error: existingItemError } = await supabase
    .from("cart_items")
    .select("*")
    .eq("cart_id", cart.cart_id)
    .eq("product_id", product_id)
    .single();

  if (existingItem) {
    return sendResponse(res, {}, 400, "Item already exists in a cart");
  }

  const { error: insertError } = await supabase
    .from("cart_items")
    .insert([{ cart_id: cart.cart_id, product_id, quantity }]);

  if (insertError) return throwError(res, insertError.message);

  return sendResponse(res, { message: "Item added to cart" }, 200);
});

const updateCartItemQuantity = catchAsync(async (req, res, next) => {
  const { cart_item_id, quantity } = req.body;

  if (!cart_item_id || quantity == null) {
    return throwError(res, "There is missing field");
  }

  if (quantity <= 0) {
    const { data, error } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_item_id", cart_item_id);

    if (error) {
      return throwError(res, error.message);
    }

    return sendResponse(res, data, "200", "success", "Item removed from cart.");
  }

  const { data, error } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("cart_item_id", cart_item_id);

  if (error) {
    return throwError(res, error.message);
  }

  return sendResponse(res, data, "200", "success", "Item quantity updated.");
});

const removeCartItem = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { data: removeData, error: removeError } = await supabase
    .from("cart_items")
    .delete()
    .eq("cart_item_id", id);

  if (removeError) return throwError(res, removeError.message);
  return sendResponse(res, removeData);
});

const clearCart = catchAsync(async (req, res, next) => {
  const { cart_id } = req.body;

  const { data: removedData, error: removeError } = await supabase
    .from("cart_items")
    .delete()
    .eq("cart_id", cart_id);

  if (removeError) {
    return next(new Error(removeError.message));
  }

  return res
    .status(200)
    .json({ message: "Cart cleared successfully.", data: removedData });
});

module.exports = {
  getCartByUserId,
  removeCartItem,
  getAllCarts,
  getOneCart,
  addItemToCart,
  clearCart,
  updateCartItemQuantity,
};
