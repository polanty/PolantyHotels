import express from "express";
import {
  getAllReviews,
  createReview,
  getReview,
  updateReview,
  deleteReview,
  createManyReviews,
} from "../../Controller/Reviews/ReviewsController.js";

const router = express.Router({ mergeParams: true });

// standard CRUD routes
router
  .route("/")
  .get(getAllReviews) // list all reviews or nested filtered
  .post(createReview)
  .post(createManyReviews); // create new review (can be nested)

router.route("/:id").get(getReview).patch(updateReview).delete(deleteReview);

// Route handlers for nested routes are defined in the controller, and the router is used here with mergeParams to access parent route parameters.
//This is because the reviews can be accessed both as a top-level resource (e.g., /reviews) and as a nested resource under hotels (e.g., /hotels/:hotelId/reviews).

export default router;
