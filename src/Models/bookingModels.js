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

//Prevent overlapping bookings for the same room
BookingSchema.index(
  { RoomRef: 1, check_in: 1, check_out: 1 },
  { unique: true },
);

const Booking = mongoose.model("Booking", BookingSchema);
export default Booking;
