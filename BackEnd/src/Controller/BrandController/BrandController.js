import Brands from "../../Models/BrandsModel.js";
import catchAsync from "../../Utilities/catchAsync.js";
import APIFeatures from "../../Utilities/apiFeatures.js";
import AppError from "../../Utilities/globalErrorCatcher.js";

// get Hotels functionality
export const getAllBrands = catchAsync(async (req, res) => {
  //BUILD THE QUERY

  //1A) Filtering to remove special query parameters

  //Object to handle all the API function
  //Filtering
  //sorting
  //pagination
  //limiting
  const apiFeatures = new APIFeatures(Brands.find(), req.query)
    .defaultyQueryWithFilter()
    .sort()
    .pagination();

  //whatever the requeste is we must limit the return data for performance
  const allHotels = await apiFeatures.query;

  const total = await Brands.countDocuments(apiFeatures.filter);
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

export const createBrand = catchAsync(async (req, res) => {
  const newHotel = await Brands.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      hotel: newHotel,
    },
  });
});

export const getOneBrand = catchAsync(async (req, res, next) => {
  const hotelId = req.params.id;

  const hotel = await Brands.findById(hotelId);

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

export const updateBrand = catchAsync(async (req, res, next) => {
  const upDatedHotels = req.body;

  //You can change the name and description but not ratingss
  const allowedUpdates = ["name", "description"];
  const attemptedUpdates = Object.keys(upDatedHotels);
  const isValidOperation = attemptedUpdates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return next(
      new AppError(
        `Invalid updates! You can only update name and description.`,
        400
      )
    );
  }

  const newHotel = await Brands.findByIdAndUpdate(
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

export const deleteBrand = catchAsync(async (req, res, next) => {
  const hotelId = req.params.id;

  //So the assumption is simple , we should set hotel as inactive and this includes all subsidiary hotels
  const brand = await Brands.findByIdAndUpdate(hotelId, {
    isActive: false,
  });

  if (!brand) {
    return next(new AppError(`Hotel not found.`, 500));
  }

  res.status(204).json({
    status: "success",
    data: {
      brand,
    },
  });
});
