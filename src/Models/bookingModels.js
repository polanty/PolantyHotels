import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID must be provided"],
    },
    RoomRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "Room ID must be provided"],
    },
    check_in: { type: Date, required: true },
    check_out: { type: Date, required: true },
    total_price: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    created_at: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// Prevent overlapping bookings for the same room
// BookingSchema.index({ room: 1, check_in: 1, check_out: 1 }, { unique: true });

// const Booking = mongoose.model("Booking", BookingSchema);
// export default Booking;

// // Booking controller
// export const createBooking = async (req, res) => {
//   const { roomId, check_in, check_out } = req.body;

//   const room = await Room.findById(roomId);
//   if (!room) return res.status(404).json({ message: "Room not found" });

//   const nights =
//     (new Date(check_out) - new Date(check_in)) / (1000 * 60 * 60 * 24);

//   const total_price = nights * room.price_per_night;

//   const booking = await Booking.create({
//     user: req.user.id,
//     room: roomId,
//     check_in,
//     check_out,
//     total_price,
//   });

//   res.status(201).json({ status: "success", booking });
// };
