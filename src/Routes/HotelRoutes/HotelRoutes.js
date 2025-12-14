import express from "express";
import Brands from "../../Models/BrandsModel.js";
import RoomTypes from "../../Models/room_typesModel.js";
import Locations from "../../Models/locationModel.js";
import qs from "qs"; // Import the qs library for query string parsing

const router = express.Router();

router.route("/").get(async (req, res) => {
  try {
    //BUILD THE QUERY
    //1A) Filtering to remove special query parameters
    let queryObj = { ...req.query };

    queryObj = qs.parse(queryObj);

    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let updatedQuery = JSON.stringify(queryObj);

    const regex = /\b(lt|lte|gt|gte)\b/g;
    // const str = "apple banana cherry grape";
    const result = updatedQuery.replace(regex, "$$$1");

    updatedQuery = JSON.parse(result);

    console.log(updatedQuery);

    res.status(200).json({
      status: "success",
      data: {
        data: { queryObj },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An error occurred while fetching hotels.",
    });
  }
});

export default router;
