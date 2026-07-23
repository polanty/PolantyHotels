import cron from "node-cron";
import Booking from "../../Models/bookingModels.js";

const PENDING_PAYMENT_EXPIRY_MINUTES = 35;

export const startReleaseRoomsJob = () => {
  cron.schedule("*/5 * * * *", async () => {
    try {
      const expiryCutoff = new Date(
        Date.now() - PENDING_PAYMENT_EXPIRY_MINUTES * 60 * 1000,
      );

      await Booking.updateMany(
        {
          status: "pending_payment",
          paymentStatus: "unpaid",
          roomReleased: false,
          createdAt: { $lte: expiryCutoff },
        },
        {
          $set: {
            status: "expired",
            roomReleased: true,
          },
        },
      );
    } catch (err) {
      console.error("Pending booking expiry job failed:", err.message);
    }
  });

  cron.schedule("0 1 * * *", async () => {
    try {
      const now = new Date();
      const bookings = await Booking.find({
        status: "confirmed",
        paymentStatus: "paid",
        checkOutDate: { $lte: now },
        roomReleased: false,
      });
      for (const booking of bookings) {
        booking.status = "completed";
        booking.roomReleased = true;
        await booking.save();
      }
    } catch (err) {
      console.error("Room release job failed:", err.message);
    }
  });
};
