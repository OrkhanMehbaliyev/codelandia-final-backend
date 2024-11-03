const supabase = require("../supabase");
const catchAsync = require("../utils/catchAsync");

const uploadImage = (bucketName) =>
  catchAsync(async (req, res, next) => {
    if (!req.file && req.method === "POST") {
      return res.status(400).json({ message: "No file uploaded" });
    }
    if (!req.file && req.method === "PUT") {
      return next();
    }

    const { data: fileData, error: fileError } = await supabase.storage
      .from(bucketName)
      .upload(`public/${req.file.originalname}`, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: "3600",
        upsert: false,
      });

    if (fileError) {
      return next(new Error(fileError.message));
    }

    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage
        .from(bucketName)
        .createSignedUrl(`public/${req.file.originalname}`, 500000 * 50000);
    if (signedUrlError) {
      return res.status(400).json({ message: signedUrlError.message });
    }

    req.signedUrl = signedUrlData.signedUrl;
    next();
  });

module.exports = uploadImage;
