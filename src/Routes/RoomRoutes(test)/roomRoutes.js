import express from "express";
import {
  getAllHotelRooms,
  createHotelRoom,
} from "../../Controller/roomController/roomController.js";

const router = express.Router();

// router.use(protect);

router.route("/").get(getAllHotelRooms).post(createHotelRoom);

// router.route("/:id").get(getOneHotel).patch(updateHotel).delete(deleteHotel);

export default router;
