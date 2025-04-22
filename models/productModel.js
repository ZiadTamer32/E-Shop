const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product name is required"],
      minlength: [3, "Product name must be at least 3 characters"],
      maxlength: [128, "Product name must be less than 128 characters"]
    },
    slug: {
      type: String,
      required: true,
      lowercase: true
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      minlength: [10, "Product description must be at least 10 characters"],
      maxlength: [2000, "Product description must be less than 512 characters"]
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: 0
    },
    priceAfterDiscount: {
      type: Number,
      min: 0
    },
    quantity: {
      type: Number,
      required: [true, "Product quantity is required"],
      min: 0
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"]
    },
    subcategory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubCategory"
      }
    ],
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand"
    },
    imageCover: {
      type: String,
      required: [true, "Product image cover is required"]
    },
    images: [String],
    colors: [String],
    sold: {
      type: Number,
      default: 0,
      min: 0
    },
    ratingsAvrege: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

productSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "product",
  localField: "_id"
});

const setImageURL = (doc) => {
  if (doc.imageCover) {
    const imageUrl = `${process.env.BASE_URL}/products/${doc.imageCover}`;
    doc.imageCover = imageUrl;
  }
  if (doc.images) {
    doc.images = doc.images.map((image) => {
      const imageUrl = `${process.env.BASE_URL}/products/${image}`;
      return imageUrl;
    });
  }
};

productSchema.post("init", (doc) => {
  setImageURL(doc);
});
productSchema.post("save", (doc) => {
  setImageURL(doc);
});

const ProductModel = mongoose.model("Product", productSchema);

module.exports = ProductModel;
