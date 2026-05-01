import cron from "node-cron";
import Booking from "./models/bookingModel.js";
import Location from "./models/locationModel.js";

cron.schedule("0 1 * * *", async () => {
  const now = new Date();

  const completedBookings = await Booking.find({
    status: "confirmed",
    checkOutDate: { $lte: now },
    roomReleased: { $ne: true },
  });

  for (const booking of completedBookings) {
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

    booking.status = "completed";
    booking.roomReleased = true;
    await booking.save();
  }
});
