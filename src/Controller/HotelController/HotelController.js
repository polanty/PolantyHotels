import Brands from "../../Models/BrandsModel.js";

// get Hotels functionality
export const getAllBrands = async (req, res) => {
  try {
    const brands = await Brands.find();

    //start working on the filtering, sorting, field limiting, and pagination

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
