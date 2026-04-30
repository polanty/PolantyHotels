import express from "express";
import { protect } from "../../Controller/authentication/authenticationController.js";
import { createCheckoutSession } from "../../Controller/paymentController/paymentController.js";

const router = express.Router();

router.post("/create-checkout-session", protect, createCheckoutSession);

export default router;
