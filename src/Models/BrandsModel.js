import mongoose from "mongoose";

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name must be provided"], // must be provided
    trim: true, // removes whitespace
    unique: [true, "Brand name must be unique"], // unique brand names
  },
  description: {
    type: String,
    required: [true, "Description must be provided"],
  },
  rating: {
    type: Number,
    min: [0, "Rating cannot be below 0"],
    max: [5, "Rating cannot exceed 5"],
    default: 4,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const Brands = mongoose.model("Brands", brandSchema);

export default Brands;
