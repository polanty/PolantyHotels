// controllers/paymentController.js
import stripe from "../../Utilities/stripe.js";
import RoomTypes from "../../Models/room_typesModel.js";
import Room from "../../Models/roomModel.js";
import Location from "../../Models/locationModel.js";
import Booking from "../../Models/bookingModels.js";
import AppError from "../../Utilities/globalErrorCatcher.js";
import catchAsync from "../../Utilities/catchAsync.js";

export const createCheckoutSession = catchAsync(async (req, res, next) => {
  const {
    hotelId,
    roomId,
    checkInDate,
    checkOutDate,
    numberOfRooms = 1,
  } = req.body;

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  if (isNaN(checkIn) || isNaN(checkOut)) {
    return next(new AppError("Invalid date format", 400));
  }

  if (checkOut <= checkIn) {
    return next(new AppError("Check-out must be after check-in", 400));
  }

  const diffInDays = (checkOut - checkIn) / (1000 * 60 * 60 * 24);
  const nights = Math.max(1, Math.ceil(diffInDays));

  const hotel = await Location.findById(hotelId).populate(
    "RoomRef.room_type_id",
  );

  if (!hotel) {
    return next(new AppError("Hotel not found", 404));
  }

  const room = hotel.RoomRef.find(
    (room) => room.room_type_id._id.toString() === roomId,
  );

  if (!room) {
    return next(new AppError("Room cannot be found", 404));
  }

  const roomType = room.room_type_id;
  const priceInfo = roomType.pricing[0];

  const price = Number(priceInfo.base_price_per_night) * nights * numberOfRooms;

  if (!price || price <= 0) {
    return next(new AppError("Invalid room type price", 400));
  }

  const updatedRoom = await Room.findOneAndUpdate(
    {
      _id: room._id,
      isAvailable: { $gt: 0 },
    },
    {
      $inc: {
        isAvailable: -1,
      },
    },
    {
      new: true,
    },
  );

  if (!updatedRoom) {
    return next(new AppError("This room is no longer available", 409));
  }

  const booking = await Booking.create({
    hotel: hotel._id,
    room: room._id,
    roomType: roomType._id,
    userRef: req.user._id,
    checkInDate: checkIn,
    checkOutDate: checkOut,
    nights,
    totalPrice: price,
    currency: priceInfo.currency,
    status: "pending_payment",
    paymentStatus: "unpaid",
    paymentIntentId: null,
    roomReleased: false,
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],

    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,

    line_items: [
      {
        price_data: {
          currency: priceInfo.currency.toLowerCase(),
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
      bookingId: booking._id.toString(),
      hotelId: hotel._id.toString(),
      roomId: room._id.toString(),
      roomTypeId: roomType._id.toString(),
      nights: String(nights),
      checkInDate,
      checkOutDate,
    },

    success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/hotels/${hotel._id}?payment=cancelled`,
  });

  booking.stripeSessionId = session.id;
  await booking.save();

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

  // console.log("Retrieved session:", session);

  res.status(200).json({
    status: "success",
    session,
  });
});

// export const createCheckoutSession = catchAsync(async (req, res, next) => {
//   const { hotelId, roomId, checkInDate, checkOutDate } = req.body;

//   const checkIn = new Date(checkInDate);
//   const checkOut = new Date(checkOutDate);

//   if (isNaN(checkIn) || isNaN(checkOut)) {
//     return next(new AppError("Invalid date format", 400));
//   }

//   if (checkOut <= checkIn) {
//     return next(new AppError("Check-out must be after check-in", 400));
//   }

//   const diffInDays = (checkOut - checkIn) / (1000 * 60 * 60 * 24);
//   const nights = Math.max(1, Math.ceil(diffInDays));

//   const hotel = await Location.findById(hotelId).populate(
//     "RoomRef.room_type_id",
//   );

//   if (!hotel) {
//     return next(new AppError("Hotel not found", 404));
//   }

//   const room = hotel.RoomRef.find(
//     (room) => room.room_type_id._id.toString() === roomId,
//   );

//   if (!room) {
//     return next(new AppError("Room cannot be found", 404));
//   }

//   const roomType = room.room_type_id;
//   const { base_price_per_night, currency } = roomType.pricing[0];

//   const price = Number(base_price_per_night) * nights;

//   if (!price || price <= 0) {
//     return next(new AppError("Invalid room type price", 400));
//   }

//   const updatedRoom = await Room.findOneAndUpdate(
//     {
//       _id: room._id,
//       isAvailable: { $gt: 0 },
//     },
//     {
//       $inc: {
//         isAvailable: -1,
//       },
//     },
//     {
//       new: true,
//     },
//   );

//   if (!updatedRoom) {
//     return next(new AppError("This room is no longer available", 409));
//   }

//   const booking = await Booking.create({
//     hotel: hotel._id,
//     room: room._id,
//     userRef: req.user._id,
//     roomType: roomType._id,
//     checkInDate: checkIn,
//     checkOutDate: checkOut,
//     nights,
//     totalPrice: price,
//     currency,
//     status: "pending_payment",
//     paymentStatus: "unpaid",
//   });

//   const session = await stripe.checkout.sessions.create({
//     mode: "payment",
//     payment_method_types: ["card"],

//     line_items: [
//       {
//         price_data: {
//           currency: currency.toLowerCase(),
//           product_data: {
//             name: roomType.name || "Hotel room booking",
//             description: roomType.description || "Room booking",
//             images: roomType.images?.length ? [roomType.images[0]] : [],
//           },
//           unit_amount: Math.round(price * 100),
//         },
//         quantity: 1,
//       },
//     ],

//     metadata: {
//       bookingId: booking._id.toString(),
//       hotelId: hotel._id.toString(),
//       roomId: room._id.toString(),
//       roomTypeId: roomType._id.toString(),
//       nights: String(nights),
//       checkInDate,
//       checkOutDate,
//     },

//     success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
//     cancel_url: `${process.env.CLIENT_URL}/hotels/${hotel._id}?payment=cancelled`,
//   });

//   booking.stripeSessionId = session.id;
//   await booking.save();

//   res.status(200).json({
//     status: "success",
//     sessionUrl: session.url,
//   });
// });
