// controllers/paymentController.js
import stripe from "../../Utilities/stripe.js";
import Location from "../../Models/locationModel.js";
import Booking from "../../Models/bookingModels.js";
import AppError from "../../Utilities/globalErrorCatcher.js";
import catchAsync from "../../Utilities/catchAsync.js";

function parseNumberOfRooms(value) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}

function formatCheckoutDate(date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getPublicBaseUrl(req) {
  return (
    process.env.API_PUBLIC_URL || `${req.protocol}://${req.get("host")}`
  ).replace(/\/$/, "");
}

function getCheckoutImageUrl(req, image) {
  if (!image || typeof image !== "string") return null;

  if (/^https?:\/\//i.test(image)) return image;

  const imagePath = image.startsWith("/") ? image : `/${image}`;
  return `${getPublicBaseUrl(req)}${imagePath}`;
}

async function countReservedRooms(roomId, checkIn, checkOut) {
  const [result] = await Booking.aggregate([
    {
      $match: {
        room: roomId,
        status: { $in: ["pending_payment", "confirmed"] },
        checkInDate: { $lt: checkOut },
        checkOutDate: { $gt: checkIn },
      },
    },
    {
      $group: {
        _id: "$room",
        reservedRooms: { $sum: { $ifNull: ["$numberOfRooms", 1] } },
      },
    },
  ]);

  return result?.reservedRooms || 0;
}

export const createCheckoutSession = catchAsync(async (req, res, next) => {
  const {
    hotelId,
    roomId,
    checkInDate,
    checkOutDate,
    numberOfRooms: requestedRooms = 1,
  } = req.body;

  const numberOfRooms = parseNumberOfRooms(requestedRooms);

  if (!numberOfRooms) {
    return next(new AppError("Please select at least one room", 400));
  }

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

  const hotel = await Location.findById(hotelId).populate({
    path: "RoomRef",
    populate: {
      path: "room_type_id",
      model: "RoomTypes",
      populate: {
        path: "pricing",
        select: "base_price_per_night currency -_id -room_type_id",
      },
    },
  });

  if (!hotel) {
    return next(new AppError("Hotel not found", 404));
  }

  const room = hotel.RoomRef.find(
    (room) =>
      room._id.toString() === roomId ||
      room.room_type_id?._id?.toString() === roomId,
  );

  if (!room) {
    return next(new AppError("Room cannot be found", 404));
  }

  const roomType = room.room_type_id;
  const priceInfo = roomType.pricing[0];

  if (!priceInfo) {
    return next(new AppError("Room type price is not configured", 400));
  }

  const reservedRooms = await countReservedRooms(room._id, checkIn, checkOut);
  const availableRooms = Number(room.isAvailable || 0) - reservedRooms;

  if (availableRooms < numberOfRooms) {
    return next(
      new AppError(
        `Only ${Math.max(availableRooms, 0)} room(s) available for those dates`,
        409,
      ),
    );
  }

  const roomPrice = Number(priceInfo.base_price_per_night);
  const price = roomPrice * nights * numberOfRooms;

  if (!price || price <= 0) {
    return next(new AppError("Invalid room type price", 400));
  }

  const booking = await Booking.create({
    hotel: hotel._id,
    room: room._id,
    roomType: roomType._id,
    userRef: req.user._id,
    checkInDate: checkIn,
    checkOutDate: checkOut,
    nights,
    numberOfRooms,
    totalPrice: price,
    currency: priceInfo.currency,
    status: "pending_payment",
    paymentStatus: "unpaid",
    paymentIntentId: null,
    roomReleased: false,
  });

  const roomImage = getCheckoutImageUrl(req, room.images?.[0]);
  const stayDates = `${formatCheckoutDate(checkIn)} to ${formatCheckoutDate(
    checkOut,
  )}`;
  const roomSummary = [
    `${hotel.name} - ${roomType.name}`,
    `${hotel.city}, ${hotel.country}`,
    `${stayDates}`,
    `${nights} night${nights === 1 ? "" : "s"}`,
    `${numberOfRooms} room${numberOfRooms === 1 ? "" : "s"}`,
    roomType.capacity ? `Sleeps up to ${roomType.capacity}` : null,
    roomType.bed_configuration,
    roomType.size_sqm ? `${roomType.size_sqm} sqm` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],

    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,

    line_items: [
      {
        price_data: {
          currency: priceInfo.currency.toLowerCase(),
          product_data: {
            name: `${hotel.name} - ${roomType.name || "Hotel room"}`,
            description: `${roomSummary}. ${roomType.description || ""}`.trim(),
            images: roomImage ? [roomImage] : [],
            metadata: {
              hotelName: hotel.name,
              roomTypeName: roomType.name || "Hotel room",
              city: hotel.city,
              country: hotel.country,
              checkInDate,
              checkOutDate,
              nights: String(nights),
              numberOfRooms: String(numberOfRooms),
            },
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
      numberOfRooms: String(numberOfRooms),
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
    bookingId: booking._id,
  });
});

export const getCheckoutSession = catchAsync(async (req, res, next) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    return next(new AppError("Checkout session id is required", 400));
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  res.status(200).json({
    status: "success",
    session,
  });
});
