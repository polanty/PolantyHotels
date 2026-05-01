import express from "express";
import { protect } from "../../Controller/authentication/authenticationController.js";
import {
  createCheckoutSession,
  getCheckoutSession,
} from "../../Controller/paymentController/paymentController.js";

const router = express.Router();

router.use(protect); // Ensure all routes are protected and require authentication

router.post("/create-checkout-session", createCheckoutSession);

router.get("/checkout-session/:sessionId", getCheckoutSession);

export default router;
