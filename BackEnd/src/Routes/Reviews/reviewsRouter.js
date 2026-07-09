import express from "express";
import {
  protect,
  restrictTo,
} from "../../Controller/authentication/authenticationController.js";
import {
  getAllReviews,
  getMyReviews,
  createReview,
  getReview,
  updateReview,
  deleteReview,
  createManyReviews,
} from "../../Controller/Reviews/ReviewsController.js";

const router = express.Router({ mergeParams: true });
router.use(protect);

// standard CRUD routes
router.route("/me").get(getMyReviews);
router.route("/").post(createReview);

router.route("/:id").get(getReview).patch(updateReview).delete(deleteReview);

router.use(restrictTo("admin"));
router.route("/").get(getAllReviews).post(createManyReviews); // create new review (can be nested)

// Route handlers for nested routes are defined in the controller, and the router is used here with mergeParams to access parent route parameters.
//This is because the reviews can be accessed both as a top-level resource (e.g., /reviews) and as a nested resource under hotels (e.g., /hotels/:hotelId/reviews).

export default router;
