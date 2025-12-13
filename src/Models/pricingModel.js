import mongoose from "mongoose";

const pricingSchema = new mongoose.Schema({
  room_type_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RoomTypes",
    required: [true, "Room Type ID must be provided"],
  },
  location_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    required: [true, "Location ID must be provided"],
  },
  base_price_per_night: {
    type: Number,
    required: [true, "Price per night must be provided"],
    min: [0, "Price per night cannot be negative"],
  },
  currency: {
    type: String,
    required: [true, "Currency must be provided"],
    trim: true,
    uppercase: true,
    enum: {
      values: ["USD", "EUR", "GBP", "JPY", "AUD", "CAD"],
      message: "Currency is not supported",
    },
  },
  effective_date: {
    type: Date,
    required: [true, "Effective date must be provided"],
  },
  created_at: {
    type: Date,
    default: Date.now,
    select: false,
  },
});

const Pricing = mongoose.model("Pricing", pricingSchema);

export default Pricing;
