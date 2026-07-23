//The following function is to safely handle the success of the payment and update the booking status accordingly. It will be called by the Stripe webhook when a payment is successful.
// As recommended by Stripe, we will not rely on the client to update the booking status, but instead use a webhook to listen for successful payments and update the booking in our database accordingly.
import Booking from "../../Models/bookingModels.js";
import User from "../../Models/userModel.js";
import stripe from "../stripe.js";
import emailService from "../email.js";

export const stripeWebhook = async (req, res) => {
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Webhook signature failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;

      if (!bookingId) {
        console.warn("Missing bookingId in Stripe metadata");
        return res.status(200).json({ received: true });
      }

      const booking = await Booking.findById(bookingId);

      if (!booking) {
        console.warn("Booking not found:", bookingId);
        return res.status(200).json({ received: true });
      }

      if (booking.paymentStatus !== "paid") {
        booking.status = "confirmed";
        booking.paymentStatus = "paid";
        booking.paymentIntentId =
          typeof session.payment_intent === "object"
            ? session.payment_intent.id
            : session.payment_intent;

        await booking.save();

      }

      try {
        const populatedBooking = await Booking.findById(bookingId)
          .populate("hotel")
          .populate("roomType");

        const user = await User.findById(booking.userRef);

        if (user?.email && populatedBooking) {
          await emailService.sendBookingEmail(user.email, populatedBooking);
        }
      } catch (emailErr) {
        console.error("Booking email failed:", emailErr.message);
      }
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;

      if (!bookingId) {
        return res.status(200).json({ received: true });
      }

      const booking = await Booking.findById(bookingId);

      if (!booking) {
        return res.status(200).json({ received: true });
      }

      if (booking.status === "pending_payment" && !booking.roomReleased) {
        booking.status = "expired";
        booking.paymentStatus = "unpaid";
        booking.roomReleased = true;

        await booking.save();

      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook handler failed:", err.message);

    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};
