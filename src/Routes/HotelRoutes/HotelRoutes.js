import express from "express";
import Brands from "../../Models/BrandsModel.js";
import RoomTypes from "../../Models/room_typesModel.js";
import Location from "../../Models/locationModel.js";
import qs from "qs"; // Import the qs library for query string parsing

const router = express.Router();

router
  .route("/")
  .get(async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const skip = (page - 1) * limit;
      //BUILD THE QUERY
      //1A) Filtering to remove special query parameters
      let queryObj = { ...req.query };

      queryObj = qs.parse(queryObj);

      const excludedFields = ["page", "sort", "limit", "fields"];
      excludedFields.forEach((el) => delete queryObj[el]);

      let updatedQuery = JSON.stringify(queryObj);

      const regex = /\b(lt|lte|gt|gte)\b/g;
      const result = updatedQuery.replace(regex, "$$$1");

      updatedQuery = JSON.parse(result);

      const allHotels = await Location.find(updatedQuery)
        .skip(skip)
        .limit(limit);

      // Total count of documents
      const total = allHotels.length;

      res.status(200).json({
        status: "success",
        results: total,
        totalPages: Math.ceil(total / limit),
        data: {
          data: { allHotels },
        },
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "An error occurred while fetching hotels.",
      });
    }
  })
  .post(async (req, res) => {
    const newHotel = await Location.create({ ...req.body });

    res.status(201).json({
      status: "success",
      data: {
        Hotel: [newHotel],
      },
    });
  });

export default router;
