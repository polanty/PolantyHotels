import mongoose from "mongoose";

const roomTypeSchema = new mongoose.Schema(
  {
    brand_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brands",
      required: [true, "Brand ID must be provided"],
    },
    name: {
      type: String,
      required: [true, "Room type name must be provided"],
      trim: true,
      Enum: {
        values: ["Single", "Double", "Suite", "Deluxe", "Family"],
        message: "Room type name is not valid",
      },
    },
    description: {
      type: String,
      required: [true, "Description must be provided"],
    },
    capacity: {
      type: Number,
      required: [true, "Capacity must be provided"],
      min: [1, "Capacity must be at least 1"],
      max: [3, "Capacity cannot exceed 10"],
    },
    bed_configuration: {
      type: String,
      required: [true, "Bed Configuration must be provided"],
    },
    size_sqm: {
      type: Number,
      required: [true, "Square meter must be provided"],
      default: 21,
    },
    created_at: {
      type: Date,
      default: Date.now,
      select: false,
    },
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const RoomTypes = mongoose.model("RoomTypes", roomTypeSchema);

export default RoomTypes;
