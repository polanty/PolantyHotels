import express from "express";
import brandRoutes from "./src/Routes/BrandRoutes/BrandRoute.js";
import hotelRoutes from "./src/Routes/HotelRoutes/HotelRoutes.js";
import userRoutes from "./src/Routes/UserRoutes/UserRoutes.js";
import authRoutes from "./src/Routes/Authentication/authRoutes.js";
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

//Authentication Routes (login, sign up, password change, passwordUpdate);
app.use("/api/v1/auth", authRoutes);

//Brands route
app.use("/api/v1/brands", brandRoutes);

//Location routes
app.use("/api/v1/hotels", hotelRoutes);

//User profile  routes (primarily for admin)
app.use("/api/v1/profile", userRoutes);

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
  if (err.name === "JsonWebTokenError") {
    err = new AppError("Invalid token. Please log in again", 400);
  }
  if (err.name === "TokenExpiredError") {
    err = new AppError("Your Token has expired! Please log in again!", 400);
  }
  //strictly to test my github configuration 
   if (err.name === "TestExpiredError") {
    err = new AppError("Your Token has expired! Please log in again!", 400);
  }
  res.status(err.statusCode || 500).send(err.message);
});

export default app;
