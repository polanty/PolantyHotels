import express from "express";
import {
  getAllHotels,
  createHotel,
  getOneHotel,
  updateHotel,
  deleteHotel,
} from "../../Controller/HotelController/HotelController.js";
import {
  protect,
  restrictTo,
} from "../../Controller/authentication/authenticationController.js";
import reviewsRouter from "../Reviews/reviewsRouter.js";

const router = express.Router();

router.use(protect); // Apply authentication middleware to all routes below this line
router.route("/:id").get(getOneHotel);

router.route("/").get(getAllHotels);

// Nested route for reviews related to a specific hotel
router.use("/:locationId/reviews", reviewsRouter);

router.use(restrictTo("admin")); // Apply admin-only middleware to all routes below this line
router.route("/:id").patch(updateHotel).delete(deleteHotel);
// router.use(protect);
router.route("/").post(createHotel);

export default router;
