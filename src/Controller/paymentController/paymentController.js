// controllers/paymentController.js
import stripe from "../../Utilities/stripe.js";
import RoomTypes from "../../Models/room_typesModel.js";
import Room from "../../Models/roomModel.js";
import Location from "../../Models/locationModel.js";
import AppError from "../../Utilities/globalErrorCatcher.js";
import catchAsync from "../../Utilities/catchAsync.js";

export const createCheckoutSession = catchAsync(async (req, res, next) => {
  const { hotelId, roomId, nights = 1 } = req.body;

  const hotel = await Location.findById(hotelId);

  if (!hotel) {
    return next(new AppError("Hotel not found", 404));
  }

  const room_type_id = hotel?.RoomRef.find(
    (room) => room.room_type_id._id.toString() === roomId,
  );

  console.log("Received createCheckoutSession request with:", {
    room_type_id,
  });

  // const price = Number(roomType.price) * Number(nights);

  // if (!price || price <= 0) {
  //   return next(new AppError("Invalid room type price", 400));
  // }

  // const session = await stripe.checkout.sessions.create({
  //   mode: "payment",

  //   payment_method_types: ["card"],

  //   line_items: [
  //     {
  //       price_data: {
  //         currency: "gbp",
  //         product_data: {
  //           name: roomType.name,
  //           description: roomType.description || "Room booking",
  //           images: roomType.images?.length ? [roomType.images[0]] : [],
  //         },
  //         unit_amount: Math.round(price * 100),
  //       },
  //       quantity: 1,
  //     },
  //   ],

  //   metadata: {
  //     roomId: roomType._id.toString(),
  //     nights: String(nights),
  //   },

  //   success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
  //   cancel_url: `${process.env.CLIENT_URL}/hotels/${roomType._id}`,
  // });

  // res.status(200).json({
  //   status: "success",
  //   sessionUrl: session.url,
  // });

  res.status(200).json({
    status: "success",
    room: hotel,
  });
});
