import express from "express";
import {
  createPricing,
  updatePricing,
} from "../../Controller/Pricing/PricingController.js";

const router = express.Router();

router.route("/pricing").post(createPricing);
router.route("/pricing/:id").patch(updatePricing);

export default router;
