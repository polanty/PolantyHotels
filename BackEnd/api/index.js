import app from "../app.js";
import { connectToDatabase } from "../src/config/database.js";

export default async function handler(req, res) {
  try {
    await connectToDatabase();
    return app(req, res);
  } catch (error) {
    console.error("Database connection failed:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Unable to connect to the database",
    });
  }
}
