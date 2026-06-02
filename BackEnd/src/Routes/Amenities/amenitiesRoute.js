import express from "express";
import { createAmenities } from "../../Controller/Amenities/AmenitiesController.js";

const router = express.Router();

router.route("/amenities").post(createAmenities);

export default router;
