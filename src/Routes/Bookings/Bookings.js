import express from "express";
import { protect } from "../../Controller/authentication/authenticationController";
import Room from "../../Models/roomModel";
import Booking from "../../Models/bookingModels";

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

router.route("/").get((req, res) => {
  return res.status(200).json({
    status: "success",
    message: "Router works ",
  });
});

export default router;
