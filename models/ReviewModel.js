const mongoose = require("mongoose");
const productModel = require("./productModel");

const reviewSchema = new mongoose.Schema(
  {
    title: String,
    rating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must be at most 5"],
      required: [true, "Rating is required"]
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"]
    },
    // parent reference to the product model (one to many relationship)
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"]
    }
  },
  {
    timestamps: true
  }
);

// Aggregate average rating and quantity
reviewSchema.statics.calcAverageRatingAndQuantity = async function (productId) {
  const result = await this.aggregate([
    // Stage 1 get all reviews for the sepecific product
    {
      $match: { product: productId }
    },
    // Stage 2 group by product and calculate average rating and quantity
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        quantity: { $sum: 1 }
      }
    }
  ]);
  if (result.length > 0) {
    await productModel.findByIdAndUpdate(productId, {
      ratingsAvrege: result[0].avgRating,
      ratingsQuantity: result[0].quantity
    });
  } else {
    await productModel.findByIdAndUpdate(productId, {
      ratingsAvrege: 0,
      ratingsQuantity: 0
    });
  }
};

//  Call a avgerage rating and quantity function after saving a review
reviewSchema.post("save", async function () {
  // this points to current review
  await this.constructor.calcAverageRatingAndQuantity(this.product);
});

reviewSchema.post("remove", async function () {
  // this points to current review
  await this.constructor.calcAverageRatingAndQuantity(this.product);
});

// Populate user
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name"
  });
  next();
});

const reviewModel = mongoose.model("Review", reviewSchema);
module.exports = reviewModel;
