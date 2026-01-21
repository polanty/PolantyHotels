import mongoose from "mongoose";
import validator from "validator";

const locationSchema = new mongoose.Schema(
  {
    brand_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brands", // must match the model name you exported
      required: true,
    },
    name: {
      type: mongoose.Schema.Types.String,
      required: [true, "Location name must be provided"],
      trim: true,
      unique: [true, "Location name must be unique"],
      ref: "Brands",
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
    created_at: {
      type: Date,
      default: Date.now,
      select: false,
    },
    email: {
      type: String,
      required: [true, "Email must be provided"],
      unique: [true, "Email must be unique"],
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
        ref: "Amenities", // must match the model name you exported
        required: true,
      },
    ],
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Attach middleware BEFORE compiling model
locationSchema.pre(/^find/, function (next) {
  this.populate("amenities", "-_id"); // only include brand name

  next();
});

locationSchema.pre(/^findOne$/, function (next) {
  this.populate({
    path: "RoomRef",
    populate: {
      path: "room_type_id",
      model: "RoomTypes",
      populate: {
        path: "pricing", // virtual on RoomTypes
        select: "base_price_per_night currency -_id -room_type_id",
      },
    },
  });

  next();
});

locationSchema.pre("save", function (next) {
  if (!validator.isEmail(this.email)) {
    return next(new Error("Invalid email format"));
  }
  next();
});

const Location = mongoose.model("Location", locationSchema);

export default Location;
