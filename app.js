import express from "express";
import hotelRouter from "./src/Routes/HotelsRoutes/HotelRoute.js";

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

app.use("/api/v1/hotels", hotelRouter);

//Global Non-existing route error handling middleware
app.use((req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send("Something broke!");
// });

export default app;
