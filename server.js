import mongoose from "mongoose";
import app from "./app.js";
import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT || 3000;

const uri = process.env.MONGO_CLUSTER.replace(
  "<USERNAME>",
  process.env.MONGO_DB_USER
).replace("<PASSWORD>", process.env.MONGO_PASS);

//console.log(process.env.MONGO_CLUSTER);

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ Connection error:", err));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
