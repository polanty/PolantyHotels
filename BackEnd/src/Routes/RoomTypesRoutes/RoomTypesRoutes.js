import express from "express";
import {
  createRoomTyoes,
  getAllRoomTypes,
  updateRoomType,
} from "../../Controller/roomTypesController/roomTypesController.js";

const router = express.Router();

// router.use(protect);

router.route("/").get(getAllRoomTypes).post(createRoomTyoes);

router.route("/:id").patch(updateRoomType);

export default router;
