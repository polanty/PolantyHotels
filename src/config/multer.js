const multer = require("multer");
const path = require("path");

// Ensure unique filenames
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});

// Allow only jpeg/png
function imageFilter(req, file, cb) {
  const allowed = /jpeg|jpg|png/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);

  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG and PNG images are allowed"));
  }
}

const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;
