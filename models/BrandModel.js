const { default: mongoose } = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Brand name is required"],
      unique: true,
      minLength: [3, "must be more than 3"],
      maxLength: [32, "must be less than 32"]
    },
    slug: {
      type: String,
      lowercase: true
    },
    image: String
  },
  {
    timestamps: true
  }
);

// Middleware For imageURL
const setImageURL = (doc) => {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/brands/${doc.image}`;
    doc.image = imageUrl;
  }
  return doc;
};
brandSchema.post("init", (doc) => {
  setImageURL(doc);
});
brandSchema.post("save", (doc) => {
  setImageURL(doc);
});

const BrandModel = mongoose.model("Brand", brandSchema);

module.exports = BrandModel;
