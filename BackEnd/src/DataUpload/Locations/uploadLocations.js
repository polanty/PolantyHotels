import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectToDatabase } from "../../config/database.js";
import { uploadLocationDocuments } from "./locationDataUploadController.js";

dotenv.config({ quiet: true });

const run = async () => {
  const keepProcessAlive = setInterval(() => {}, 1000);

  try {
    await connectToDatabase({
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 10000,
    });
    await uploadLocationDocuments();
  } catch (error) {
    console.error("Location upload failed:", error.message);
    const serverErrors = error.reason?.servers
      ? [...error.reason.servers.values()]
          .map((server) => server.error?.message)
          .filter(Boolean)
      : [];

    if (serverErrors.length > 0) {
      console.error("MongoDB server details:", [...new Set(serverErrors)]);
    }
    process.exitCode = 1;
  } finally {
    clearInterval(keepProcessAlive);
    await mongoose.disconnect();
  }
};

await run();
