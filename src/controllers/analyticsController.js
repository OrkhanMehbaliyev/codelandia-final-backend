const catchAsync = require("../utils/catchAsync");
const supabase = require("../supabase");
const sendResponse = require("../utils/sendResponse");
const { throwError } = require("../utils/throwError");
const { get } = require("../routes/cartRoutes");
const getCounts = catchAsync(async (req, res, next) => {
  const { data: productData, error: productError } = await supabase
    .from("products")
    .select("*");

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*");
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .select("*");
  if (orderError || userError || productError) {
    return throwError(res, "Some errror occured");
  }

  const data = {
    products: productData.length,
    users: userData.length,
    orders: orderData.length,
  };
  return sendResponse(res, data);
});
const getTotalSalesByCategory = catchAsync(async (req, res, next) => {
  const { data, error } = await supabase
    .from("category_sales_stats")
    .select("*")
    .order("total_sales", { ascending: 0 })
    .limit(3);

  if (error) {
    return throwError(res, error.message);
  }

  return sendResponse(res, data);
});
const getMostSoldProducts = catchAsync(async (req, res, next) => {
  const { data, error } = await supabase
    .from("products")
    .select("*, categories (name)")
    .order("soldAmount", { ascending: false })
    .limit(8);
  if (error) return throwError(res, error.message);

  return sendResponse(res, data);
});
module.exports = { getCounts, getTotalSalesByCategory, getMostSoldProducts };
