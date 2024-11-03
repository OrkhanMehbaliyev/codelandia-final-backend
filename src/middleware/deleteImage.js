const supabase = require("../supabase");
const catchAsync = require("../utils/catchAsync");

const deleteImage = (tableName, tableIdFieldName, bucketName) =>
  catchAsync(async (req, res, next) => {
    if (!req.file) {
      return next();
    }

    const id = req.params.id;
    const { data: oldImageData, error: oldImageError } = await supabase
      .from(tableName)
      .select("image")
      .eq(tableIdFieldName, id)
      .single();

    if (oldImageError) throw new Error(oldImageError.message);

    const oldImageURL = oldImageData?.image;
    const oldImagePath = oldImageURL.split(`${bucketName}/`)[1].split("?")[0];
    const { data: removeData, error: removeError } = await supabase.storage
      .from(bucketName)
      .remove([oldImagePath]);

    if (removeError) next(new Error("remove"));
    next();
  });

module.exports = deleteImage;
