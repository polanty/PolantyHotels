import express from "express";
import User from "../../Models/userModel.js";
import catchAsync from "../../Utilities/catchAsync.js";

const router = express.Router();

//Creating Administrative functionalities for Users

router
  .route("/")
  .get(
    //get all users
    catchAsync(async (req, res) => {
      res.status(200).json({
        status: "success",
        data: {
          users: ["User1", "User2", "User3"],
        },
      });
    })
  )
  .post(
    //Create user
    catchAsync(async (req, res, next) => {
      console.log(req.body);

      const newUser = await User.create({ ...req.body });

      res.status(201).json({
        status: "success",
        data: {
          user: newUser,
        },
      });
    })
  );

router.route("/:id").get(
  //get single user
  catchAsync(async (req, res) => {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return next(new AppError("User not found 💥", 404));
    }

    return res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  })
);

export default router;
