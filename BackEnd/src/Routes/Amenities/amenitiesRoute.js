import express from "express";
import {
  protect,
  restrictTo,
} from "../../Controller/authentication/authenticationController.js";
import {
  createAmenities,
  getAmenities,
} from "../../Controller/Amenities/AmenitiesController.js";

const router = express.Router();

router.use(protect, restrictTo("admin"));

router.route("/amenities").get(getAmenities).post(createAmenities);

export default router;
