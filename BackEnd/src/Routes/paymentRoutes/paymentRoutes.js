import express from "express";
import Booking from "../../Models/bookingModels.js";
import catchAsync from "../../Utilities/catchAsync.js";
import { protect } from "../../Controller/authentication/authenticationController.js";
import {
  createCheckoutSession,
  getCheckoutSession,
} from "../../Controller/paymentController/paymentController.js";

const router = express.Router();

router.use(protect); // Ensure all routes are protected and require authentication

router.post("/create-checkout-session", createCheckoutSession);

router.get("/checkout-session/:sessionId", getCheckoutSession);

router.get(
  "/",
  catchAsync(async (req, res) => {
    const userId = req.user.id;
    const userBookings = await Booking.find({ userRef: userId }).populate({
      path: "room",
      populate: [
        {
          path: "location_id",
          select: "name",
        },
        {
          path: "room_type_id",
        },
      ],
    });

    res.status(200).json({
      status: "success",
      userId: req.user.id,
      user: req.user,
      bookings: userBookings,
      message: "Payment routes are working",
    });
  }),
);

export default router;
