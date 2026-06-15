const multer = require("multer");

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter(req, file, callback) {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return callback(
        new Error("Only images, PDFs, TXT, DOC, and DOCX files are allowed")
      );
    }

    callback(null, true);
  },
});

module.exports = upload;