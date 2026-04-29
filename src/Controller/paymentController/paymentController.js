// controllers/paymentController.js
import stripe from "../Utilities/stripe.js";
import Location from "../Models/locationModel.js";
import AppError from "../Utilities/globalErrorCatcher.js";
import catchAsync from "../Utilities/catchAsync.js";

export const createCheckoutSession = catchAsync(async (req, res, next) => {
  const { hotelId, nights = 1 } = req.body;

  const hotel = await Location.findById(hotelId);

  if (!hotel) {
    return next(new AppError("Hotel not found", 404));
  }

  const price = Number(hotel.price) * Number(nights);

  if (!price || price <= 0) {
    return next(new AppError("Invalid hotel price", 400));
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",

    payment_method_types: ["card"],

    line_items: [
      {
        price_data: {
          currency: "gbp",
          product_data: {
            name: hotel.name,
            description: hotel.address || "Hotel booking",
            images: hotel.images?.length ? [hotel.images[0]] : [],
          },
          unit_amount: Math.round(price * 100),
        },
        quantity: 1,
      },
    ],

    metadata: {
      hotelId: hotel._id.toString(),
      nights: String(nights),
    },

    success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/hotels/${hotel._id}`,
  });

  res.status(200).json({
    status: "success",
    sessionUrl: session.url,
  });
});
