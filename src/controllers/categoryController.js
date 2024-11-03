const catchAsync = require("../utils/catchAsync");
const supabase = require("../supabase");
const sendResponse = require("../utils/sendResponse");
const { throwError } = require("../utils/throwError");

const getAllCategories = catchAsync(async (req, res, next) => {
  const data = await supabase.from("categories").select("*");
  return res.status(200).json(data);
});

const getOneCategory = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  console.log(id);
  if (!id) return throwError(res, "id is not valid");
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("category_id", id)
    .single();
  if (error) return throwError(res, error.message);
  return sendResponse(res, data);
});

const createCategory = catchAsync(async (req, res, next) => {
  if (!req.body.name) return throwError(res, "Name is not defined");
  const { data: postData, error: postError } = await supabase
    .from("categories")
    .insert([{ name: req.body.name, image: req.signedUrl }]);
  if (postError) {
    return throwError(res, postError.message);
  }
  console.log(postData);
  return sendResponse(res, postData, "201", "success", "Category created.");
});

const updateCategory = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  if (req.file) {
    const signedUrl = req.signedUrl;
    const { data: updateData, error: updateError } = await supabase
      .from("categories")
      .update([{ name: req.body.name, image: signedUrl }])
      .eq("category_id", id);
    if (updateError) {
      return throwError(res, updateError.message);
    }
    return sendResponse(res, updateData, "201", "success", "Category updated.");
  } else {
    const { data: updateData, error: updateError } = await supabase
      .from("categories")
      .update([{ name: req.body.name }])
      .eq("category_id", id);

    if (updateError) {
      return throwError(res, updateError.message);
    }

    return sendResponse(res, updateData, "201", "success", "Category updated.");
  }
});

module.exports = {
  getAllCategories,
  getOneCategory,
  createCategory,
  updateCategory,
};
