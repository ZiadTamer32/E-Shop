const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: true,
      minLength: [3, "subCategory must be at least 3 characters"],
      maxLength: [32, "subCategory must be less than 32 characters"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "SubCategory parent is required"],
    },
  },
  { timestamps: true }
);
const subCategoryModel = mongoose.model("SubCategory", subCategorySchema);
module.exports = subCategoryModel;
