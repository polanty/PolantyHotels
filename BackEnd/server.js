import app from "./app.js";
import { startReleaseRoomsJob } from "./src/Utilities/NodeCron/nodeCron.js";
import { connectToDatabase } from "./src/config/database.js";
import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT || 3000;

connectToDatabase().catch((err) =>
  console.error("❌ Connection error:", err),
);

// Start the cron job to release rooms after check-out
startReleaseRoomsJob();

app.listen(port);
