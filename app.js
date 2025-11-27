import express from "express";

//loading environment variables
import dotenv from "dotenv";
dotenv.config();

// console.log(process.env);

const app = express();

// app.use((req, res, next) => {
//   console.log(req.headers.cookie);
//   next();
// });

// Middleware to parse JSON bodies
app.use(express.json());

app.get("/api/v1/hotels", async (req, res) => {
  try {
    res.status(200).json({
      status: "success",
      data: {
        hotels: ["Hotel One", "Hotel Two", "Hotel Three"],
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An error occurred while fetching hotels.",
    });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

export default app;
