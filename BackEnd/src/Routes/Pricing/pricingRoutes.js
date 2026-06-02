import express from "express";
import { createPricing } from "../../Controller/Pricing/PricingController.js";

const router = express.Router();

router.route("/pricing").post(createPricing);

export default router;
