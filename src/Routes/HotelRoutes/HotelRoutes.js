import express from "express";
import {
  getAllHotels,
  createHotel,
  getOneHotel,
  updateHotel,
  deleteHotel,
} from "../../Controller/HotelController/HotelController.js";

const router = express.Router();

router.route("/").get(getAllHotels).post(createHotel);

router.route("/:id").get(getOneHotel).patch(updateHotel).delete(deleteHotel);

export default router;
