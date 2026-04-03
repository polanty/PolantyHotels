import mongoose from "mongoose";

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

// ⭐ Prevent duplicate reviews per user per location
reviewSchema.index({ user_id: 1, location_id: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
