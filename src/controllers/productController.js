const supabase = require("../supabase");
const catchAsync = require("../utils/catchAsync");
const sendResponse = require("../utils/sendResponse");
const { throwError } = require("../utils/throwError");

const getAllProducts = catchAsync(async (req, res, next) => {
  const category = req.query.category || "";
  const categoryArray = category.split(",");
  const sortBy = req.query.sortBy || "";
  const sortOrder = req.query.sortOrder || "Ascending";
  const search = req.query.search || "";
  const limit = req.query.limit || 10;
  const page = req.query.page || 1;

  const offset = (page - 1) * limit;
  const minPrice = parseFloat(req.query.minPrice) || 0;
  const maxPrice = parseFloat(req.query.maxPrice) || Infinity;

  let query = supabase.from("products").select(
    `*,
    categories!inner (
      name
    )`,
    { count: "exact" }
  );

  if (search !== "all" && search !== "") {
    console.log(search);
    query.ilike("name", `%${search}%`);
  }

  if (category !== "all" && category !== "") {
    console.log("gir");
    query = query.in("categories.name", categoryArray);
  }

  if (minPrice > 0) {
    query = query.gte("price", minPrice);
  }

  if (maxPrice < Infinity) {
    query = query.lte("price", maxPrice);
  }
  if (sortBy !== "") {
    query.order(sortBy, { ascending: sortOrder === "Ascending" });
  }

  const { data, error, count } = await query.range(
    offset,
    Number(offset) + Number(limit) - 1
  );

  if (error) {
    return throwError(res, error.message);
  }

  return sendResponse(res, data, 200, null, count);
});
const getOneProduct = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  if (!id) return throwError(res, "Id is not valid");

  const { data, error } = await supabase
    .from("products")
    .select("*, categories ( name )")
    .eq("product_id", id)
    .single();

  if (error) return throwError(res, error.message);

  return sendResponse(res, data);
});

const getPopularProducts = catchAsync(async (req, res, next) => {
  const { data, error } = await supabase
    .from("products")
    .select("*, categories (name)")
    .order("soldAmount", { ascending: false })
    .limit(4);

  if (error) return throwError(res, error.message);

  return sendResponse(res, data);
});

const createProduct = catchAsync(async (req, res, next) => {
  if (
    !req.body.name ||
    !req.body.short_description ||
    !req.body.description ||
    !req.body.price ||
    !req.body.category_id
  )
    return throwError(res, "Some field is missing");

  const { data: postData, error: postError } = await supabase
    .from("products")
    .insert([
      {
        name: req.body.name,
        short_description: req.body.short_description,
        long_description: req.body.description,
        price: req.body.price,
        category_id: req.body.category_id,
        image: req.signedUrl,
        rating: 0,
        soldAmount: 0,
        ratingCount: 0,
        feat_1: "Lorem ipsum a dolle celano keyira some",
        feat_2: "Lorem ipsum a dolle celano keyira some",
        feat_3: "Lorem ipsum a dolle celano keyira some",
      },
    ]);
  if (postError) {
    return throwError(res, postError.message);
  }
  return res.status(201).json(postData);
});

const updateProduct = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  console.log("body:", req.body);
  if (
    !req.body.name ||
    !req.body.short_description ||
    !req.body.long_description ||
    !req.body.price ||
    !req.body.category_id
  )
    return throwError(res, "Some field is missing");

  if (req.file) {
    const signedUrl = req.signedUrl;
    const { data: updateData, error: updateError } = await supabase
      .from("products")
      .update([
        {
          name: req.body.name,
          short_description: req.body.short_description,
          long_description: req.body.long_description,
          price: req.body.price,
          category_id: req.body.category_id,
          image: signedUrl,
        },
      ])
      .eq("product_id", id);

    if (updateError) {
      return throwError(res, updateError.message);
    }

    return sendResponse(
      res,
      updateData,
      201,
      "success",
      "Product updated successfully!"
    );
  } else {
    const { data: updateData, error: updateError } = await supabase
      .from("products")
      .update([
        {
          name: req.body.name,
          short_description: req.body.short_description,
          long_description: req.body.long_description,
          price: req.body.price,
          category_id: req.body.category_id,
        },
      ])
      .eq("product_id", id);

    if (updateError) {
      return throwError(res, updateError.message);
    }

    return sendResponse(
      res,
      updateData,
      201,
      "success",
      "Product updated successfully!"
    );
  }
});

const deleteProduct = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const { data: reviewData, error: reviewError } = await supabase
    .from("reviews")
    .delete()
    .eq("product_id", id);
  if (reviewError) {
    return throwError(res, reviewError.message);
  }

  const { data: deleteData, error: deleteError } = await supabase
    .from("products")
    .delete()
    .eq("product_id", id);
  if (deleteError) {
    if (deleteError.message.includes("order"))
      return throwError(res, "This product is a part of order.");
    return throwError(res, deleteError.message);
  }

  return sendResponse(res, deleteData, 204);
});

const getProductsBySearch = catchAsync(async (req, res, next) => {
  const search = req.query.search || "";

  let query = supabase.from("products").select(`*,
    categories!inner (
      name
    )`);
  if (search !== "") {
    query.ilike("name", `%${search}%`).limit(4);
  }

  const { data, error } = await query;

  if (error) {
    throwError(res, error.message);
  }

  return sendResponse(res, data);
});

module.exports = {
  getAllProducts,
  getOneProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getPopularProducts,
  getProductsBySearch,
};
