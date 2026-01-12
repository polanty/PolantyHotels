import Room from "../../Models/roomModel";
import Pricing from "../../Models/pricingModel";
import RoomTypes from "../../Models/room_typesModel";
import catchAsync from "../../Utilities/catchAsync";

export const createHotel = catchAsync(async (req, res, next) => {
  const newHotel = await Room.create({ ...req.body });

  res.status(201).json({
    status: "success",
    data: {
      Hotel: [newHotel],
    },
  });
});
