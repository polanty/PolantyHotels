import express from "express";
import brandRoutes from "./src/Routes/BrandRoutes/BrandRoute.js";
import hotelRoutes from "./src/Routes/HotelRoutes/HotelRoutes.js";
import morgan from "morgan";

import AppError from "./src/Utilities/globalErrorCatcher.js";

//loading environment variables
import dotenv from "dotenv";
dotenv.config();

// console.log(process.env);

const app = express();

// app.use((req, res, next) => {
//   console.log(process.env);

//   next();
// });

// Middleware to parse JSON bodies
app.use(express.json());

// Mount all the routes for dev environment
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api/v1/brands", brandRoutes);

app.use("/api/v1/hotels", hotelRoutes);

//Global Non-existing route error handling middleware
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.message);
  if (err.message.startsWith("Cast to ObjectId failed")) {
    err = new AppError("Invalid ID format", 400);
  }
  res.status(err.statusCode || 500).send(err.message);
});

export default app;
