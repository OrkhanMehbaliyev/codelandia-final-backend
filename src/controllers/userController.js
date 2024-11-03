const catchAsync = require("../utils/catchAsync");
const supabase = require("../supabase");
const sendResponse = require("../utils/sendResponse");
const { throwError } = require("../utils/throwError");
const getAllUsers = catchAsync(async (req, res, next) => {
  // Extract the search query from the request query parameters
  const { search } = req.query;
  const limit = req.query.limit || 10;
  const page = req.query.page || 1;
  const offset = (page - 1) * limit;
  // Build the Supabase query with optional search filtering
  let query = supabase
    .from("users")
    .select("user_id, username, email, role, created_at", { count: "exact" });

  // Apply search filter if a search query is provided
  if (search) {
    query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const {
    data: userData,
    error: userError,
    count,
  } = await query.range(Number(offset), Number(offset) + Number(limit) - 1);

  if (userError) {
    console.log("err");
    console.log(userError.message);
    return throwError(res, userError.message);
  }
  return sendResponse(res, userData, 200, null, count);
});
const getOneUser = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  if (!id) return throwError(res, "Id is not valid");
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("user_id,username,email,role,created_at")
    .eq("user_id", id)
    .single();

  if (userError) {
    return throwError(res, userError.message);
  }
  return sendResponse(res, userData);
});
const updateUser = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  console.log(req.body);
  if (!id) return throwError(res, "Id is not valid");
  if (!req.body.username || !req.body.role) {
    return throwError(res, "There is missing field.");
  }
  const { data: updateData, error: updateError } = await supabase
    .from("users")
    .update([
      {
        username: req.body.username,
        role: req.body.role,
      },
    ])
    .eq("user_id", id);
  if (updateError) {
    return throwError(res, updateError.message);
  }
  return sendResponse(res, updateData, 201);
});
module.exports = { updateUser, getAllUsers, getOneUser };
