import express from "express";
import User from "../../Models/userModel.js";
import { protect } from "../../Controller/authentication/authenticationController.js";
import catchAsync from "../../Utilities/catchAsync.js";
import AppError from "../../Utilities/globalErrorCatcher.js";

const router = express.Router();

//Creating Administrative functionalities for Users

router.use(protect);

router.route("/").get(
  //get all users
  catchAsync(async (req, res, next) => {
    res.status(200).json({
      status: "success",
      data: {
        users: ["User1", "User2", "User3"],
      },
    });
  })
);

router.route("/:id").get(
  //get single user
  catchAsync(async (req, res, next) => {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return next(new AppError("User not found 💥", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  })
);

export default router;
