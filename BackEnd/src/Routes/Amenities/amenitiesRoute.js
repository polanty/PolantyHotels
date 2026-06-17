import express from "express";
import {
  protect,
  restrictTo,
} from "../../Controller/authentication/authenticationController.js";
import { createAmenities } from "../../Controller/Amenities/AmenitiesController.js";

const router = express.Router();

router.use(protect, restrictTo("admin"));

router.route("/amenities").post(createAmenities);

export default router;
