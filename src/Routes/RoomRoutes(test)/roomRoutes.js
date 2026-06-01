import express from "express";
import {
  getAllHotelRooms,
  createHotelRoom,
  getOneHotelRoom,
  uploadRoomImages,
} from "../../Controller/roomController/roomController.js";

const router = express.Router();

// router.use(protect);

router.route("/").get(getAllHotelRooms).post(uploadRoomImages, createHotelRoom);

router.route("/:id").get(getOneHotelRoom);

export default router;
