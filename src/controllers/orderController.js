const catchAsync = require("../utils/catchAsync");
const supabase = require("../supabase");
const sendResponse = require("../utils/sendResponse");
const { throwError } = require("../utils/throwError");
const getAllOrders = catchAsync(async (req, res, next) => {
  const {
    limit = 10,
    page = 1,
    search = "",
    status = "",
    sortBy = "order_id",
    sortOrder = "Ascending",
  } = req.query;

  const offset = (page - 1) * limit;
  let query = supabase
    .from("orders")
    .select("*, users!inner (username)", { count: "exact" });
  if (search !== "all" && search !== "") {
    console.log(search);
    query.ilike("users.username", `%${search}%`);
  }
  if (sortBy !== "") {
    query.order(sortBy, { ascending: sortOrder === "Ascending" });
  }
  const {
    data: ordersData,
    error,
    count,
  } = await query.range(offset, Number(offset) + Number(limit) - 1);

  if (error) {
    return throwError(res, error.message);
  }

  const ordersWithItems = await Promise.all(
    ordersData.map(async (order) => {
      const { data: orderItemsData, error: orderItemsError } = await supabase
        .from("order_items")
        .select(
          "*, products (name, product_id, price, image, categories (name))"
        )
        .eq("order_id", order.order_id);

      if (orderItemsError) return throwError(res, orderItemsError.message);

      const orderItems = orderItemsData.map((item) => ({
        order_item_id: item.order_item_id,
        product_id: item.products.product_id,
        product_name: item.products.name,
        product_price: item.products.price,
        product_image: item.products.image,
        category_name: item.products.categories.name,
        quantity: item.quantity,
      }));

      return {
        order_id: order.order_id,
        created_at: order.created_at,
        total_price: order.total_price,
        username: order.users.username,
        order_items: orderItems,
        status: order.status,
      };
    })
  );
  console.log("count", count);
  return sendResponse(res, ordersWithItems, 200, null, count);
});
const getOrdersByUserId = catchAsync(async (req, res, next) => {
  const user_id = req.params.user_id;

  if (!user_id) return throwError(res, "ID is not valid");

  const { data: ordersData, error: ordersError } = await supabase
    .from("orders")
    .select("*, users (username)")
    .eq("user_id", user_id);

  if (ordersError) return throwError(res, ordersError.message);
  if (!ordersData || ordersData.length === 0) {
    return sendResponse(res, { orders: [] });
  }

  const ordersWithItems = await Promise.all(
    ordersData.map(async (order) => {
      const { data: orderItemsData, error: orderItemsError } = await supabase
        .from("order_items")
        .select(
          "*, products (name, product_id, price, image, categories (name))"
        )
        .eq("order_id", order.order_id);
      console.log("order");
      console.log(orderItemsData);
      if (orderItemsError) return throwError(res, orderItemsError.message);

      const orderItems = orderItemsData.map((item) => ({
        order_item_id: item.order_item_id,
        product_id: item.products.product_id,
        product_name: item.products.name,
        product_price: item.products.price,
        product_image: item.products.image,
        category_name: item.products.categories.name,
        quantity: item.quantity,
      }));
      console.log(order);
      return {
        order_id: order.order_id,
        created_at: order.created_at,
        total_price: order.total_price,
        order_items: orderItems,
        status: order.status,
      };
    })
  );

  return sendResponse(res, ordersWithItems);
});
const addOrder = catchAsync(async (req, res, next) => {
  const { cart_id, user_id } = req.body;

  if (!cart_id || !user_id) {
    return throwError(res, "Cart ID or User ID is missing");
  }

  const { data: cartItems, error: cartError } = await supabase
    .from("cart_items")
    .select("*, products (product_id, price, name, image,soldAmount)")
    .eq("cart_id", cart_id);

  if (cartError) return throwError(res, cartError.message);

  if (!cartItems || cartItems.length === 0) {
    return throwError(res, "Cart is empty");
  }

  const totalAmount = cartItems.reduce((acc, item) => {
    return acc + item.products.price * item.quantity;
  }, 0);

  const { data: newOrder, error: orderError } = await supabase
    .from("orders")
    .insert([{ user_id, total_price: totalAmount, status: "pending" }])
    .select();

  if (orderError) return throwError(res, orderError.message);

  const orderId = newOrder[0].order_id;

  const orderItems = cartItems.map((item) => ({
    order_id: orderId,
    product_id: item.products.product_id,
    quantity: item.quantity,
    price: item.products.price,
  }));

  const { error: orderItemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (orderItemsError) return throwError(res, orderItemsError.message);

  await Promise.all(
    cartItems.map(async (item) => {
      console.log("soldamount,", item.products.soldAmount);
      const newSoldAmount = item.products.soldAmount + item.quantity;
      console.log(newSoldAmount);
      const { error: updateError } = await supabase
        .from("products")
        .update({ soldAmount: newSoldAmount })
        .eq("product_id", item.products.product_id);

      if (updateError) return throwError(res, updateError.message);
    })
  );

  await supabase.from("cart_items").delete().eq("cart_id", cart_id);

  return sendResponse(res, newOrder[0]);
});
const updateOrder = catchAsync(async (req, res, next) => {
  const { order_id } = req.params;
  const { status } = req.body;
  if (!order_id) {
    return throwError(res, "Id is invalid.");
  }
  if (!status) {
    return throwError(res, "No status provided.");
  }
  const { data: updatedData, error: updatedError } = await supabase
    .from("orders")
    .update([{ status }])
    .eq("order_id", order_id);
  if (updatedError) {
    return throwError(res, updatedError.message);
  }
  return sendResponse(res, updatedData);
});
const deleteOrder = catchAsync(async (req, res, next) => {
  const { order_id } = req.params;

  const { data: deleteData, error: deleteError } = await supabase
    .from("order_items")
    .delete()
    .eq("order_id", order_id);
  if (deleteError) {
    return throwError(res, deleteError.message);
  }
  const { data: deleteOrderData, error: deleteOrderError } = await supabase
    .from("orders")
    .delete()
    .eq("order_id", order_id);
  if (deleteOrderError) {
    return throwError(res, deleteOrderError.message);
  }
  return sendResponse(res, deleteOrderData);
});
module.exports = {
  getOrdersByUserId,
  addOrder,
  getAllOrders,
  updateOrder,
  deleteOrder,
};
