// models/locationModel.js
import mongoose from "mongoose";
import validator from "validator";

const locationSchema = new mongoose.Schema(
  {
    brand_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brands",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Location name must be provided"],
      trim: true,
      unique: true,
    },
    address: {
      type: String,
      required: [true, "Address must be provided"],
    },
    city: {
      type: String,
      required: [true, "City must be provided"],
    },
    country: {
      type: String,
      required: [true, "Country must be provided"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    postal_code: {
      type: String,
      required: [true, "Postal code must be provided"],
    },
    latitude: {
      type: Number,
      required: [true, "Latitude must be provided"],
    },
    longitude: {
      type: Number,
      required: [true, "Longitude must be provided"],
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },

    created_at: {
      type: Date,
      default: Date.now,
      select: false,
    },

    email: {
      type: String,
      required: [true, "Email must be provided"],
      unique: true,
      validate: {
        validator: validator.isEmail,
        message: "Please provide a valid email address",
      },
    },

    RoomRef: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Room",
      },
    ],

    amenities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Amenities",
        required: true,
      },
    ],

    ratingsAverage: {
      type: Number,
      default: 0,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

locationSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "location_id",
  localField: "_id",
});

// Populate amenities on all find queries
locationSchema.pre(/^find/, function (next) {
  this.populate("amenities", "-_id -__v");
  next();
});

// Populate RoomRef deeply on findOne
locationSchema.pre(/^findOne$/, function (next) {
  this.populate({
    path: "RoomRef",
    populate: {
      path: "room_type_id",
      model: "RoomTypes",
      populate: {
        path: "pricing",
        select: "base_price_per_night currency -_id -room_type_id",
      },
    },
  });
  next();
});

locationSchema.index({ location: "2dsphere" });

const Location = mongoose.model("Location", locationSchema);
export default Location;
