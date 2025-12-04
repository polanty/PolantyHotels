import express from "express";
import Brands from "../../Models/BrandsModel.js";
import {
  getAllBrands,
  createBrand,
  getOneBrand,
  updateBrand,
} from "../../Controller/HotelController/HotelController.js";

// import { fileURLToPath } from "url";
// import { dirname } from "path";

//loading environment variables
import dotenv from "dotenv";
dotenv.config();

const hotelRouter = express.Router();

// Recreate __filename and __dirname
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

hotelRouter.route("/").get(getAllBrands).post(createBrand);

hotelRouter
  .route("/:id")
  .get(getOneBrand)
  .patch(updateBrand)
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
