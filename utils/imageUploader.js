const cloudinary = require("cloudinary");

exports.uploadToCloudinary = async (file, folder, height, quality) => {
  try {
    const options = { folder };
    if (height) {
      options.height = height;
    }
    if (quality) {
      options.quality = quality;
    }
    options.resource_type = "auto";
    const image = await cloudinary.uploader.upload(file.tempFilePath, options);
    console.log("Image -> ", image);
    return image;
  } catch (e) {
    console.error("Error occured while uploading image");
  }
};
