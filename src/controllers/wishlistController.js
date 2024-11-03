const catchAsync = require("../utils/catchAsync");
const supabase = require("../supabase");
const sendResponse = require("../utils/sendResponse");
const { throwError } = require("../utils/throwError");

const getAllWishlists = catchAsync(async (req, res, next) => {
  const data = await supabase.from("wishlists").select("*");
  return res.status(200).json(data);
});

const getOneWishlist = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  if (!id) return throwError(res, "id is not valid");
  const { data, error } = await supabase
    .from("wishlists")
    .select("*")
    .eq("wishlist_id", id)
    .single();
  if (error) return throwError(res, error.message);
  return sendResponse(res, data);
});

const getWishlistByUserId = catchAsync(async (req, res, next) => {
  const user_id = req.params.user_id;

  if (!user_id) return throwError(res, "id is not valid");
  const { data: wishlistData, error: wishlistError } = await supabase
    .from("wishlists")
    .select("*")
    .eq("user_id", user_id)
    .single();

  if (!wishlistData) {
    return sendResponse(res, {});
  }

  if (wishlistError) return throwError(res, wishlistError.message);
  const { data: detailedData, error: detailedError } = await supabase
    .from("wishlist_items")
    .select("*, products (name,product_id,price,image, categories (name))")
    .eq("wishlist_id", wishlistData.wishlist_id);
  if (detailedError) return throwError(res, detailedError.message);

  const wishlist_items = detailedData.map((el) => ({
    wishlist_item_id: el.wishlist_item_id,
    product_id: el.products.product_id,
    product_name: el.products.name,
    product_price: el.products.price,
    product_image: el.products.image,
    category_name: el.products.categories.name,
  }));

  const refinedData = {
    wishlist_id: wishlistData.wishlist_id,
    createdAt: wishlistData.createdAt,
    wishlist_items: wishlist_items,
  };

  return sendResponse(res, refinedData);
});

const addItemToWishlist = catchAsync(async (req, res, next) => {
  const { user_id, product_id } = req.body;

  if (!user_id || !product_id)
    return throwError(res, "There is missing field.");

  let { data: wishlist, error: wishlistError } = await supabase
    .from("wishlists")
    .select("*")
    .eq("user_id", user_id)
    .single();

  if (!wishlist) {
    const { data: newWishlist, error: newWishlistError } = await supabase
      .from("wishlists")
      .insert([{ user_id }])
      .select()
      .single();

    if (newWishlistError) return throwError(res, newWishlistError.message);
    wishlist = newWishlist;
  }

  const { data: existingItem, error: existingItemError } = await supabase
    .from("wishlist_items")
    .select("*")
    .eq("wishlist_id", wishlist.wishlist_id)
    .eq("product_id", product_id)
    .single();

  if (existingItem) {
    return sendResponse(res, {}, 400, "Item already exists in a Wishlist");
  }

  const { error: insertError } = await supabase
    .from("wishlist_items")
    .insert([{ wishlist_id: wishlist.wishlist_id, product_id }]);
  if (insertError) return throwError(res, insertError.message);

  return sendResponse(res, { message: "Item added to wishlist" }, 200);
});

const removeWishlistItem = catchAsync(async (req, res, next) => {
  const { product_id, user_id } = req.body;

  if (!product_id || !user_id) {
    return throwError(res, "There is missing field");
  }

  const { data: wishlistData, error: wishlistError } = await supabase
    .from("wishlists")
    .select("wishlist_id")
    .eq("user_id", user_id)
    .single();

  if (wishlistError || !wishlistData) {
    return throwError(res, "Wishlist not found");
  }

  const wishlist_id = wishlistData.wishlist_id;

  const { data: removeData, error: removeError } = await supabase
    .from("wishlist_items")
    .delete()
    .eq("wishlist_id", wishlist_id)
    .eq("product_id", product_id);

  if (removeError) {
    return throwError(res, removeError.message);
  }

  return sendResponse(res, removeData);
});

const clearWishlist = catchAsync(async (req, res, next) => {
  const { user_id } = req.body;
  const { data: wishlistData, error: wishlistError } = await supabase
    .from("wishlists")
    .select("wishlist_id")
    .eq("user_id", user_id)
    .single();

  if (wishlistError || !wishlistData) {
    return throwError(res, "Wishlist not found.");
  }

  const wishlist_id = wishlistData.wishlist_id;

  const { data: removedData, error: removeError } = await supabase
    .from("wishlist_items")
    .delete()
    .eq("wishlist_id", wishlist_id);

  if (removeError) {
    return next(new Error(removeError.message));
  }

  return res
    .status(200)
    .json({ message: "Wishlist cleared successfully.", data: removedData });
});

module.exports = {
  getWishlistByUserId,
  removeWishlistItem,
  getAllWishlists,
  getOneWishlist,
  addItemToWishlist,
  clearWishlist,
};
