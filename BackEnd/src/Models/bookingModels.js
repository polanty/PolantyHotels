import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },

    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    roomType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RoomType",
      required: true,
    },

    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    checkInDate: {
      type: Date,
      required: true,
    },

    checkOutDate: {
      type: Date,
      required: true,
    },

    nights: {
      type: Number,
      required: true,
      min: 1,
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      required: true,
      default: "USD",
    },

    status: {
      type: String,
      enum: [
        "pending_payment",
        "confirmed",
        "cancelled",
        "completed",
        "expired",
      ],
      default: "pending_payment",
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded", "failed"],
      default: "unpaid",
    },

    paymentIntentId: {
      type: String,
      default: null,
    },
    roomReleased: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Prevent overlapping bookings for the same room
BookingSchema.index(
  { room: 1, checkInDate: 1, checkOutDate: 1 },
  { unique: false },
);

const Booking = mongoose.model("Booking", BookingSchema);

export default Booking;
