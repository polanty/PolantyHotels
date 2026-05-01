//The following function is to safely handle the success of the payment and update the booking status accordingly. It will be called by the Stripe webhook when a payment is successful.
// As recommended by Stripe, we will not rely on the client to update the booking status, but instead use a webhook to listen for successful payments and update the booking in our database accordingly.
import emailService from "../email.js";
import Booking from "../Models/bookingModel.js";
import Location from "../Models/locationModel.js";
import stripe from "../Utilities/stripe.js";

export const stripeWebhook = async (req, res) => {
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const session = event.data.object;

  if (event.type === "checkout.session.completed") {
    const booking = await Booking.findById(session.metadata.bookingId);

    if (booking && booking.paymentStatus !== "paid") {
      booking.status = "confirmed";
      booking.paymentStatus = "paid";
      booking.stripePaymentIntentId = session.payment_intent;
      booking.paidAt = new Date();

      await booking.save();

      // Send confirmation email here
      await emailService.sendBookingEmail(booking.user, booking);
    }
  }

  if (event.type === "checkout.session.expired") {
    const booking = await Booking.findById(session.metadata.bookingId);

    if (booking && booking.status === "pending_payment") {
      booking.status = "expired";
      booking.paymentStatus = "unpaid";

      await booking.save();

      await Location.updateOne(
        {
          _id: booking.hotel,
          "RoomRef._id": booking.room,
        },
        {
          $inc: {
            "RoomRef.$.isAvailable": 1,
          },
        },
      );
    }
  }

  res.status(200).json({ received: true });
};
