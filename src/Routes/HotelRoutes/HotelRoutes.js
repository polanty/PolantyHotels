import express from "express";
import Location from "../../Models/locationModel.js";
import qs from "qs"; // Import the qs library for query string parsing
import APIFeatures from "../../Utilities/apiFeatures.js";

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

      let query;
      const apiFeatures = new APIFeatures(Location, queryObj);

      query = apiFeatures.defaultyQueryWithFilter().sort();

      //whatever the requeste is we must limit the return data for performance
      const allHotels = await query.skip(skip).limit(limit);

      const total = await Location.countDocuments(apiFeatures.filter);
      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        status: "success",
        results: total,
        totalPages,
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

router
  .route("/:id")
  .get(async (req, res) => {
    try {
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
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  })
  .patch(async (req, res) => {
    try {
      const hotelId = req.params.id;

      res.status(200).json({
        status: "sucess",
        data: {
          hotel: `This Hotel has id ${hotelId}`,
        },
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  })
  .delete(async (req, res) => {
    try {
      const hotelId = req.params.id;

      res.status(200).json({
        status: "sucess",
        data: {
          hotel: `This Hotel has id ${hotelId}`,
        },
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  });

export default router;
