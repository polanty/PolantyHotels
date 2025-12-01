import express from "express";

//loading environment variables
import dotenv from "dotenv";
dotenv.config();

const hotelRouter = express.Router();

hotelRouter.route("/").get(async (req, res) => {
  try {
    // throw new Error("Database connection failed"); //
    res.status(200).json({
      status: "success",
      data: {
        hotels: ["Hotel One", "Hotel Two", "Hotel Three"],
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An error occurred while fetching hotels.",
    });
  }
});

hotelRouter
  .route("/:id")
  .get(async (req, res) => {
    const hotelId = req.params.id;
    console.log("Fetching details for hotel ID:", req.params);
    try {
      res.status(200).json({
        status: "success",
        data: {
          hotel: `Details of Hotel with ID: ${hotelId}`,
        },
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "An error occurred while fetching the hotel details.",
      });
    }
  })
  .post(async (req, res) => {
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
  });

export default hotelRouter;
