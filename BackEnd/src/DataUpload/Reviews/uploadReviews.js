import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectToDatabase } from "../../config/database.js";
import { ensureMinimumLocationReviews } from "./reviewDataUploadController.js";

dotenv.config({ quiet: true });

const run = async () => {
  const keepProcessAlive = setInterval(() => {}, 1000);

  try {
    await connectToDatabase({
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 10000,
    });

    const result = await ensureMinimumLocationReviews();
    process.stdout.write(
      `Review upload complete: ${result.locations} locations checked, ` +
        `${result.inserted} reviews inserted, minimum ${result.minimumReviews} reviews per location.\n`,
    );
  } catch (error) {
    console.error("Review upload failed:", error.message);
    process.exitCode = 1;
  } finally {
    clearInterval(keepProcessAlive);
    await mongoose.disconnect();
  }
};

await run();
