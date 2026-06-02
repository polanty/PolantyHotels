import mongoose from "mongoose";

const locationAmenities = new mongoose.Schema({
  location_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    required: [true, "Location ID must be provided"],
  },
  amenity_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Amenities",
    required: [true, "Location ID must be provided"],
  },
  created_at: {
    type: Date,
    default: Date.now,
    select: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

export const hotelAmenities = mongoose.model(
  "locationAmenities",
  locationAmenities,
);
