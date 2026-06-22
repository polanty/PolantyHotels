import express from "express";
import User from "../../Models/userModel.js";
import Booking from "../../Models/bookingModels.js";
import {
  protect,
  restrictTo,
} from "../../Controller/authentication/authenticationController.js";
import catchAsync from "../../Utilities/catchAsync.js";
import AppError from "../../Utilities/globalErrorCatcher.js";

const router = express.Router();

// Creating Administrative functionalities for Users
router.use(protect, restrictTo("admin"));

router.route("/").post(
  catchAsync(async (req, res, next) => {
    const newUser = await User.create({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      nationality: req.body.nationality,
      date_of_birth: req.body.date_of_birth,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role: "user",
    });

    res.status(201).json({
      status: "success",
      data: {
        user: {
          _id: newUser._id,
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          email: newUser.email,
          nationality: newUser.nationality,
          date_of_birth: newUser.date_of_birth,
          role: newUser.role,
          profile_image: newUser.profile_image,
          created_at: newUser.created_at,
          last_login: newUser.last_login,
          bookingCount: 0,
        },
      },
    });
  }),
);

router.route("/").get(
  catchAsync(async (req, res, next) => {
    const currentPage = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const skip = (currentPage - 1) * limit;

    const users = await User.find()
      .select(
        "first_name last_name email role nationality date_of_birth profile_image created_at last_login",
      )
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    const totalResults = await User.countDocuments();

    const bookingCounts = await Booking.aggregate([
      { $group: { _id: "$userRef", totalBookings: { $sum: 1 } } },
    ]);

    const bookingCountByUserId = new Map(
      bookingCounts.map((bookingCount) => [
        bookingCount._id.toString(),
        bookingCount.totalBookings,
      ]),
    );

    res.status(200).json({
      status: "success",
      results: users.length,
      totalResults,
      currentPage,
      totalPages: Math.ceil(totalResults / limit) || 1,
      limit,
      data: {
        users: users.map((user) => ({
          ...user.toObject(),
          bookingCount: bookingCountByUserId.get(user._id.toString()) || 0,
        })),
      },
    });
  }),
);

router.route("/:id").get(
  catchAsync(async (req, res, next) => {
    const userId = req.params.id;

    const user = await User.findById(userId).select(
      "first_name last_name email role nationality date_of_birth profile_image created_at last_login",
    );

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const bookings = await Booking.find({ userRef: userId })
      .populate("hotel", "name city country")
      .populate("room", "roomNumber room_name name")
      .populate("roomType", "name type title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      data: {
        user,
        bookings,
      },
    });
  }),
);

export default router;
