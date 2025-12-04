import Brands from "../../Models/BrandsModel.js";

// get Hotels functionality
export const getAllBrands = async (req, res) => {
  try {
    let brands;

    brands = await Brands.find();

    //start working on the filtering, sorting, field limiting, and pagination
    console.log(req.query);

    res.status(200).json({
      status: "success",
      data: {
        brands,
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
