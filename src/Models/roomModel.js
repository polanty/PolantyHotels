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
    type: Boolean,
    default: true,
  },
  images: [String],
  // is_available: {
  //   type: Number,
  //   required: [true, "Number of available rooms must be provided"],
  // },
});

const Room = mongoose.model("Room", roomSchema);

export default Room;
