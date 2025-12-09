import Brands from "../../Models/BrandsModel.js";
import qs from "qs"; // Import the qs library for query string parsing

// get Hotels functionality
export const getAllBrands = async (req, res) => {
  try {
    //BUILD THE QUERY
    //1A) Filtering to remove special query parameters
    let queryObj = { ...req.query };

    queryObj = qs.parse(queryObj);

    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    const queryStr = JSON.stringify(queryObj);

    //Advanced Filtering
    const modifiedQueryStr = queryStr.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    const query = Brands.find(JSON.parse(modifiedQueryStr));

    //start working on the filtering, sorting, field limiting, and pagination
    if (req.query.sort) {
      console.log("I can now use sorting");
    }

    const filteredBrands = await query;

    res.status(200).json({
      status: "success",
      data: {
        data: { filteredBrands },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An error occurred while fetching hotels.",
    });
  }
};

export const createBrand = async (req, res) => {
  try {
    const newHotel = await Brands.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        hotel: newHotel,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const getOneBrand = async (req, res) => {
  const hotelId = req.params.id;

  try {
    const hotel = await Brands.findById(hotelId);

    if (!hotel) {
      throw new Error("Hotel not found");
    }

    res.status(200).json({
      status: "success",
      data: {
        hotel,
      },
    });
  } catch (error) {
    res.status(500).json({
      // error,
      status: "error",
      message: error.message,
    });
  }
};

export const updateBrand = async (req, res) => {
  try {
    const upDatedHotels = req.body;

    //You can change the name and description but not ratingss
    const allowedUpdates = ["name", "description"];
    const attemptedUpdates = Object.keys(upDatedHotels);
    const isValidOperation = attemptedUpdates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid updates! You can only update name and description.",
      });
    }

    const newHotel = await Brands.findByIdAndUpdate(
      req.params.id,
      upDatedHotels,
      { new: true, runValidators: true }
    );

    //persit the User who Updated the hotel - future feature
    //persist the time of update - future feature

    res.status(201).json({
      status: "success",
      data: {
        hotel: newHotel,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An error occurred while creating the hotel.",
    });
  }
};
