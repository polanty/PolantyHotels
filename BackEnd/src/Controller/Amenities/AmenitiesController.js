import { Amenities } from "../../Models/amenitiesModel.js";
import catchAsync from "../../Utilities/catchAsync.js";

export const getAmenities = catchAsync(async (req, res, next) => {
  const amenities = await Amenities.find().select("category name description");

  res.status(200).json({
    status: "success",
    results: amenities.length,
    data: {
      amenities,
    },
  });
});

export const createAmenities = catchAsync(async (req, res, next) => {
  const newAmenities = await Amenities.insertMany(req.body);

  res.status(201).json({
    status: "success",
    data: {
      newAmenities,
    },
  });
});
