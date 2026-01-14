import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  location_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    required: [true, "Location ID must be provided"],
  },
  room_type_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RoomTypes",
    required: [true, "Room Type ID must be provided"],
  },
  isAvailable: {
    type: Number,
    required: [true, "Available Numbers must be provided"],
  },
  images: [String],
  created_at: {
    type: Date,
    default: Date.now,
    select: false,
  },
});

const Room = mongoose.model("Room", roomSchema);

export default Room;
