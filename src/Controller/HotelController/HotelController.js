import Location from "../../Models/locationModel.js";
import catchAsync from "../../Utilities/catchAsync.js";
import AppError from "../../Utilities/globalErrorCatcher.js";
import APIFeatures from "../../Utilities/apiFeatures.js";

export const getAllHotels = catchAsync(async (req, res) => {
  //BUILD THE QUERY

  //1A) Filtering to remove special query parameters

  //Object to handle all the API function
  //Filtering
  //sorting
  //pagination
  //limiting
  const apiFeatures = new APIFeatures(Location.find(), req.query)
    .defaultyQueryWithFilter()
    .sort()
    .pagination();

  //whatever the requeste is we must limit the return data for performance
  const allHotels = await apiFeatures.query;

  const total = await Location.countDocuments(apiFeatures.filter);
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

export const createHotel = catchAsync(async (req, res) => {
  const newHotel = await Location.create({ ...req.body });

  res.status(201).json({
    status: "success",
    data: {
      Hotel: [newHotel],
    },
  });
});

export const getOneHotel = catchAsync(async (req, res) => {
  const hotelId = req.params.id;

  const hotel = await Location.findById(hotelId);

  if (!hotel) {
    return next(new AppError("Hotel not found 💥", 404));
  }

  return res.status(200).json({
    status: "success",
    data: {
      hotel,
    },
  });
});

export const updateHotel = catchAsync(async (req, res) => {
  const hotelId = req.params.id;

  res.status(200).json({
    status: "sucess",
    data: {
      hotel: `This Hotel has id ${hotelId}`,
    },
  });
});

export const deleteHotel = catchAsync(async (req, res) => {
  const hotelId = req.params.id;

  res.status(200).json({
    status: "sucess",
    data: {
      hotel: `This Hotel has id ${hotelId}`,
    },
  });
});
