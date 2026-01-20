import { Amenities } from "../../Models/amenitiesModel.js";
import catchAsync from "../../Utilities/catchAsync.js";

export const createAmenities = catchAsync(async (req, res, next) => {
  const newAmenities = await Amenities.create({ ...req.body });

  res.status(201).json({
    status: "success",
    data: {
      newAmenities,
    },
  });
});
