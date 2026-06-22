import express from "express";
import {
  protect,
  restrictTo,
} from "../../Controller/authentication/authenticationController.js";
import Room from "../../Models/roomModel.js";
import Booking from "../../Models/bookingModels.js";

const router = express.Router();

router.use(protect);

//Booking route should be protected and only accessible if you're logged in
//every booking needs a location ID and also a User ID
//if these are available then check if that room have not been booked during that time period
//if all of these goes throgh then you want to use strip to check out based on the calculation of all days combined per room price

// Booking controller
export const createBooking = async (req, res) => {
  const { roomId, check_in, check_out } = req.body;

  const room = await Room.findById(roomId);
  if (!room) return res.status(404).json({ message: "Room not found" });

  const nights =
    (new Date(check_out) - new Date(check_in)) / (1000 * 60 * 60 * 24);

  const total_price = nights * room.price_per_night;

  const booking = await Booking.create({
    user: req.user.id,
    room: roomId,
    check_in,
    check_out,
    total_price,
  });

  res.status(201).json({ status: "success", booking });
};

router.use(restrictTo("admin"));
// Admin can update or delete booking but this should also persist the information of the admin that did it

router.route("/").get(async (req, res, next) => {
  try {
    const currentPage = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const skip = (currentPage - 1) * limit;

    const bookings = await Booking.find()
      .populate("userRef", "first_name last_name email role")
      .populate("hotel", "name city country")
      .populate("room", "roomNumber room_name name")
      .populate("roomType", "name type title")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalResults = await Booking.countDocuments();

    return res.status(200).json({
      status: "success",
      results: bookings.length,
      totalResults,
      currentPage,
      totalPages: Math.ceil(totalResults / limit) || 1,
      limit,
      data: {
        bookings,
      },
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
