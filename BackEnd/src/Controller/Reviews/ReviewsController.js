import mongoose from "mongoose";
import Review from "../../Models/reviewModel.js";
import catchAsync from "../../Utilities/catchAsync.js";
import AppError from "../../Utilities/globalErrorCatcher.js";
import APIFeatures from "../../Utilities/apiFeatures.js";

// get all reviews (with filtering by query or nested route)
export const getAllReviews = catchAsync(async (req, res, next) => {
  // Validate params
  if (
    req.params.locationId &&
    !mongoose.Types.ObjectId.isValid(req.params.locationId)
  ) {
    return next(new AppError("Invalid location parameter", 400));
  }

  if (
    req.params.userId &&
    !mongoose.Types.ObjectId.isValid(req.params.userId)
  ) {
    return next(new AppError("Invalid user", 400));
  }

  // Build filter
  let filter = {};
  if (req.params.locationId) filter.location_id = req.params.locationId;
  if (req.params.userId) filter.user_id = req.params.userId;

  // Apply API features
  const apiFeatures = new APIFeatures(Review.find(filter), req.query)
    .defaultyQueryWithFilter()
    .sort()
    .pagination();

  const reviews = await apiFeatures.query
    .populate("user_id", "first_name last_name email")
    .populate("location_id", "name city country");

  // Correct total count (filtered, not paginated)
  const total = await Review.countDocuments(filter);

  res.status(200).json({
    status: "success",
    results: total,
    currentPage: apiFeatures.page,
    totalPages: Math.ceil(total / apiFeatures.limit) || 1,
    totalResults: total,
    limit: apiFeatures.limit,
    data: { reviews },
  });
});

// create a review
export const createReview = catchAsync(async (req, res, next) => {
  // when nested, set needed ids
  if (req.params.locationId) req.body.location_id = req.params.locationId;
  if (req.params.userId) req.body.user_id = req.params.userId;

  const newReview = await Review.create(req.body);
  res.status(201).json({
    status: "success",
    data: { review: newReview },
  });
});

// get single review
export const getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) return next(new AppError("Review not found 💥", 404));

  res.status(200).json({ status: "success", data: { review } });
});

// update review
export const updateReview = catchAsync(async (req, res, next) => {
  const allowedUpdates = ["rating", "comment"];
  const attempted = Object.keys(req.body);
  const valid = attempted.every((u) => allowedUpdates.includes(u));
  if (!valid) {
    return next(
      new AppError(
        "Invalid updates! You can only change rating or comment.",
        400,
      ),
    );
  }

  const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!review) return next(new AppError("Review not found 💥", 404));

  res.status(200).json({ status: "success", data: { review } });
});

// delete review
export const deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) return next(new AppError("Review not found 💥", 404));

  res.status(204).json({ status: "success", data: null });
});

// create many reviews
export const createManyReviews = catchAsync(async (req, res, next) => {
  let reviews = req.body;

  // ensure request body is an array
  if (!Array.isArray(reviews)) {
    return next(new AppError("Request body must be an array of reviews", 400));
  }

  // apply nested route params to each review if present
  reviews = reviews.map((review) => {
    const newReview = { ...review };

    if (req.params.locationId) newReview.location_id = req.params.locationId;
    if (req.params.userId) newReview.user_id = req.params.userId;

    return newReview;
  });

  const createdReviews = await Review.insertMany(reviews, { ordered: true });

  res.status(201).json({
    status: "success",
    results: createdReviews.length,
    data: {
      reviews: createdReviews,
    },
  });
});
