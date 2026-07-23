import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectToDatabase } from "../../config/database.js";
import { rebalanceLocationRooms } from "./roomRebalanceController.js";

dotenv.config({ quiet: true });

const run = async () => {
  const keepProcessAlive = setInterval(() => {}, 1000);

  try {
    await connectToDatabase({
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 10000,
    });

    const result = await rebalanceLocationRooms();
    process.stdout.write(
      `Room rebalance complete: ${result.locations} locations updated, ` +
        `${result.roomsCreated} rooms created, ` +
        `${result.minimumTypesPerLocation}-${result.maximumTypesPerLocation} distinct room types per location.\n`,
    );
  } catch (error) {
    console.error("Room rebalance failed:", error.message);
    process.exitCode = 1;
  } finally {
    clearInterval(keepProcessAlive);
    await mongoose.disconnect();
  }
};

await run();
