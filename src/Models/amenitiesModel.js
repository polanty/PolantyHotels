import mongoose from "mongoose";

const amenitiesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Amenity name must be provided"],
    trim: true,
    unique: [true, "Amenity name must be unique"],
  },
  description: {
    type: String,
    required: [true, "Amenity description must be provided"],
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

export const Amenities = mongoose.model("Amenities", amenitiesSchema);
