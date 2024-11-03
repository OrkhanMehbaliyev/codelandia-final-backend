const catchAsync = require("../utils/catchAsync");
const supabase = require("../supabase");
const sendResponse = require("../utils/sendResponse");
const { throwError } = require("../utils/throwError");

const getReviewsByProduct = catchAsync(async (req, res, next) => {
  const { product_id } = req.params;
  if (!product_id) return throwError(res, "ID is not valid");

  const { page = 1 } = req.query;

  const offset = (page - 1) * 5;

  const {
    data: reviewsData,
    error: reviewsError,
    count,
  } = await supabase
    .from("reviews")
    .select("*,users (username)", { count: "exact" })
    .eq("product_id", product_id)
    .range(offset, Number(offset) + Number(5) - 1);

  if (reviewsError) return throwError(res, reviewsError.message);

  return sendResponse(res, reviewsData, 200, null, count);
});

const addReview = catchAsync(async (req, res, next) => {
  const { user_id, product_id, rating, comment } = req.body;
  const { data: existingRating, error: checkError } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", product_id)
    .eq("user_id", user_id);

  if (checkError && checkError.details !== "0 rows")
    return throwError(res, checkError.message);

  if (existingRating[0]) {
    console.log("you alreadt rated");
    return throwError(res, "You already rated");
  }

  const { data: reviewData, error: reviewError } = await supabase
    .from("reviews")
    .insert([{ product_id, user_id, rating, comment }]);

  if (reviewError) return throwError(res, reviewError.message);

  const { data: ratingsOfAProductData, error: ratingsError } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", product_id);

  if (ratingsError) return throwError(res, ratingsError.message);

  const ratings = ratingsOfAProductData.map((r) => r.rating);

  const averageRating =
    ratings.reduce((acc, cur) => acc + cur, 0) / ratings.length;

  const { data: updateData, error: updateError } = await supabase
    .from("products")
    .update({ rating: averageRating, ratingCount: ratings.length })
    .eq("product_id", product_id);

  if (updateError) {
    return throwError(res, updateError.message);
  }
  return sendResponse(res, updateData);
});

module.exports = { getReviewsByProduct, addReview };
