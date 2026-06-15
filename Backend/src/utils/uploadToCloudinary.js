const cloudinary = require("../config/cloudinary");

function uploadToCloudinary(fileBuffer, originalName) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "taskforge/attachments",
        resource_type: "auto",
        use_filename: true,
        unique_filename: true,
        filename_override: originalName,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
}

module.exports = uploadToCloudinary;