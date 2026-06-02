import cron from "node-cron";
import Booking from "../../Models/bookingModels.js";
import Location from "../../Models/locationModel.js";

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
        await Room.updateOne(
          { _id: booking.room },
          { $inc: { isAvailable: 1 } },
        );
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
