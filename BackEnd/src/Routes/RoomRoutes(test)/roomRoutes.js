import express from "express";
import {
  getAllHotelRooms,
  createHotelRoom,
  getOneHotelRoom,
  updateHotelRoom,
  uploadRoomImages,
} from "../../Controller/roomController/roomController.js";

const router = express.Router();

// router.use(protect);

router.route("/").get(getAllHotelRooms).post(uploadRoomImages, createHotelRoom);

router.route("/:id").get(getOneHotelRoom).patch(updateHotelRoom);

export default router;
