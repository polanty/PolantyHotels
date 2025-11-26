import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGO_CLUSTER.replace(
  "<USERNAME>",
  process.env.MONGO_DB_USER
).replace("<PASSWORD>", process.env.MONGO_PASS);

console.log(process.env.MONGO_CLUSTER);

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ Connection error:", err));
