const mongoose = require("mongoose");
// 1-Create Schema
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is requierd"],
      unique: [true, "Category must be unique"],
      minLength: [3, "must be more than 3"],
      maxLength: [32, "must be more than 3"]
    },
    slug: {
      type: String,
      lowercase: true
    },
    image: String
  },
  { timestamps: true }
);

// Middleware For imageURL
const setImageURL = (doc) => {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/categories/${doc.image}`;
    doc.image = imageUrl;
  }
  return doc;
};
categorySchema.post("init", (doc) => {
  setImageURL(doc);
});
categorySchema.post("save", (doc) => {
  setImageURL(doc);
});

// 2-Convert Schema to Model
const categoryModel = mongoose.model("Category", categorySchema);

module.exports = categoryModel;
