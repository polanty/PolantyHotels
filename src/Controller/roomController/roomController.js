import Room from "../../Models/roomModel.js";
import Pricing from "../../Models/pricingModel.js";
import RoomTypes from "../../Models/room_typesModel.js";
import APIFeatures from "../../Utilities/apiFeatures.js";
import catchAsync from "../../Utilities/catchAsync.js";

export const createHotelRoom = catchAsync(async (req, res, next) => {
  const newRoom = await Room.create({ ...req.body });

  res.status(201).json({
    status: "success",
    data: {
      Rooms: [newRoom],
    },
  });
});

export const getAllHotelRooms = catchAsync(async (req, res, next) => {
  //BUILD THE QUERY

  //1A) Filtering to remove special query parameters

  //Object to handle all the API function
  //Filtering
  //sorting
  //pagination
  //limiting
  const apiFeatures = new APIFeatures(Room.find(), req.query)
    .defaultyQueryWithFilter()
    .sort()
    .pagination();

  //whatever the requeste is we must limit the return data for performance
  //i can use the .explain method to measure statistics
  // expecially when i need to index my model for optimized query
  const allHotels = await apiFeatures.query;

  const total = await Room.countDocuments(apiFeatures.filter);
  const totalPages = Math.ceil(total / apiFeatures.limit);

  res.status(200).json({
    status: "success",
    results: total,
    totalPages,
    currentPage: apiFeatures.page,
    data: {
      data: { allHotels },
    },
  });
});
