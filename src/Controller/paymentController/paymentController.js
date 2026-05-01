// controllers/paymentController.js
import stripe from "../../Utilities/stripe.js";
import RoomTypes from "../../Models/room_typesModel.js";
import Room from "../../Models/roomModel.js";
import Location from "../../Models/locationModel.js";
import AppError from "../../Utilities/globalErrorCatcher.js";
import catchAsync from "../../Utilities/catchAsync.js";

export const createCheckoutSession = catchAsync(async (req, res, next) => {
  const { hotelId, roomId, nights = 1 } = req.body;

  const hotel = await Location.findById(hotelId).populate(
    "RoomRef.room_type_id",
  );

  if (!hotel) {
    return next(new AppError("Hotel not found", 404));
  }

  const room = hotel?.RoomRef.find(
    (room) => room.room_type_id._id.toString() === roomId,
  );

  if (!room) {
    return next(new AppError("Room cannot be found", 404));
  }

  console.log(room.room_type_id.pricing[0]);

  const { base_price_per_night, currency } = room?.room_type_id.pricing[0];

  const price = Number(base_price_per_night) * Number(nights);

  if (!price || price <= 0) {
    return next(new AppError("Invalid room type price", 400));
  }

  console.log("Received createCheckoutSession request with:", {
    price,
  });

  const roomType = room.room_type_id;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],

    line_items: [
      {
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: roomType.name || "Hotel room booking",
            description: roomType.description || "Room booking",
            images: roomType.images?.length ? [roomType.images[0]] : [],
          },
          unit_amount: Math.round(price * 100),
        },
        quantity: 1,
      },
    ],

    metadata: {
      hotelId: hotel._id.toString(),
      roomId: roomType._id.toString(),
      nights: String(nights),
    },

    success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/hotels/${hotel._id}?payment=cancelled`,
  });

  res.status(200).json({
    status: "success",
    sessionUrl: session.url,
  });
});

export const getCheckoutSession = catchAsync(async (req, res, next) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    return next(new AppError("Checkout session id is required", 400));
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  console.log("Retrieved session:", session);

  res.status(200).json({
    status: "success",
    session,
  });
});
