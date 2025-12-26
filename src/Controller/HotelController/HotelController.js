import Location from "../../Models/locationModel.js";
import catchAsync from "../../Utilities/catchAsync.js";
import AppError from "../../Utilities/globalErrorCatcher.js";
import APIFeatures from "../../Utilities/apiFeatures.js";

export const getAllHotels = catchAsync(async (req, res, next) => {
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
  //i can use the .explain method to measure statistics
  // expecially when i need to index my model for optimized query
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

export const createHotel = catchAsync(async (req, res, next) => {
  const newHotel = await Location.create({ ...req.body });

  res.status(201).json({
    status: "success",
    data: {
      Hotel: [newHotel],
    },
  });
});

export const getOneHotel = catchAsync(async (req, res, next) => {
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

export const updateHotel = catchAsync(async (req, res, next) => {
  const upDatedHotels = req.body;

  //You can change the name and description but not ratingss
  const allowedUpdates = ["name", "address"];
  const attemptedUpdates = Object.keys(upDatedHotels);
  const isValidOperation = attemptedUpdates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return next(
      new AppError(
        `Invalid updates! You can only update name and address.`,
        400
      )
    );
  }

  const newHotel = await Location.findByIdAndUpdate(
    req.params.id,
    upDatedHotels,
    { new: true, runValidators: true }
  );

  //persit the User who Updated the hotel - future feature
  //persist the time of update - future feature

  res.status(204).json({
    status: "success",
    data: {
      hotel: newHotel,
    },
  });
});

export const deleteHotel = catchAsync(async (req, res, next) => {
  const hotelId = req.params.id;

  //So the assumption is simple , we should set hotel as inactive and this includes all subsidiary hotels
  const hotel = await Location.findByIdAndUpdate(hotelId, {
    isActive: false,
  });

  if (!hotel) {
    return next(new AppError(`Hotel not found.`, 500));
  }

  res.status(204).json({
    status: "success",
    data: {
      hotel,
    },
  });
});
