import cron from "node-cron";
import Booking from "../../Models/bookingModels.js";

export const startReleaseRoomsJob = () => {
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
      console.log(`Released ${bookings.length} completed booking rooms`);
    } catch (err) {
      console.error("Room release job failed:", err.message);
    }
  });
};
