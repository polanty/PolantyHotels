import express from "express";
import Brands from "../../Models/BrandsModel.js";

// import { fileURLToPath } from "url";
// import { dirname } from "path";

//loading environment variables
import dotenv from "dotenv";
dotenv.config();

const hotelRouter = express.Router();

// Recreate __filename and __dirname
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

hotelRouter
  .route("/")
  .get(async (req, res) => {
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
  })
  .post(async (req, res) => {
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
  });

hotelRouter
  .route("/:id")
  .get(async (req, res) => {
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
        status: "error",
        message: error.message,
      });
    }
  })
  .patch(async (req, res) => {
    try {
      const newHotel = req.body;

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
  })
  .delete(async (req, res) => {
    const hotelId = req.params.id;
    try {
      res.status(204).json({
        status: "success",
        data: null,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "An error occurred while deleting the hotel.",
      });
    }
  });

export default hotelRouter;
