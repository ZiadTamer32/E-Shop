const multer = require("multer");
const ApiError = require("../utils/ApiErrors");

const multerMethod = () => {
  const multerDiskStorage = multer.memoryStorage();
  const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new ApiError("Only images are allowed", 400), false);
    }
  };
  const upload = multer({
    storage: multerDiskStorage,
    fileFilter: multerFilter
  });
  return upload;
};

exports.singleImageUpload = (schemaName) => multerMethod().single(schemaName);

exports.multiImagesUpload = (arrayName) => multerMethod().fields(arrayName);

// const multerDiskStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/categories");
//   },
//   filename: (req, file, cb) => {
//     // category-${id}-${Date.now()}.jpg
//     const ext = file.mimetype.split("/")[1];
//     const fileName = `category-${uuidv4()}-${Date.now()}.${ext}`;
//     cb(null, fileName);
//   }
// });
