// models/reviewModel.js
import mongoose from "mongoose";
import Location from "./locationModel.js"; // Needed for updating ratings

const reviewSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID must be provided"],
  },
  location_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    required: [true, "Location ID must be provided"],
  },
  rating: {
    type: Number,
    required: [true, "Rating must be provided"],
    min: [1, "Rating must be at least 1"],
    max: [5, "Rating cannot exceed 5"],
  },
  title: String,
  comment: {
    type: String,
    trim: true,
    required: [true, "Comment must be provided"],
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Prevent duplicate reviews per user per location
reviewSchema.index({ user_id: 1, location_id: 1 }, { unique: true });

/**
 * STATIC METHOD: Calculate average rating + number of reviews
 * This method runs an aggregation pipeline to compute:
 * - total number of reviews for a location
 * - average rating for that location
 * Then updates the Location document with these values
 */
reviewSchema.statics.calcAverageRatings = async function (locationId) {
  const stats = await this.aggregate([
    { $match: { location_id: locationId } }, // Only reviews for this location
    {
      $group: {
        _id: "$location_id",
        nRatings: { $sum: 1 }, // Count reviews
        avgRating: { $avg: "$rating" }, // Average rating
      },
    },
  ]);

  if (stats.length > 0) {
    // Update location with computed stats
    await Location.findByIdAndUpdate(locationId, {
      ratingsQuantity: stats[0].nRatings,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    // No reviews left → reset values
    await Location.findByIdAndUpdate(locationId, {
      ratingsQuantity: 0,
      ratingsAverage: 0,
    });
  }
};

/**
 * POST-SAVE MIDDLEWARE
 * Runs after a review is created
 * Automatically recalculates ratings for the location
 */
reviewSchema.post("save", function () {
  this.constructor.calcAverageRatings(this.location_id);
});

/**
 * PRE + POST MIDDLEWARE for findOneAndUpdate / findOneAndDelete
 * Mongoose does NOT give access to the updated/deleted doc in post middleware,
 * so we manually fetch it in pre middleware and store it in `this.r`
 */
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne(); // Store the review being updated/deleted
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  if (this.r) {
    await this.r.constructor.calcAverageRatings(this.r.location_id);
  }
});

const Review = mongoose.model("Review", reviewSchema);
export default Review;
