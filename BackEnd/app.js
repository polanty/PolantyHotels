import express from "express";
import cors from "cors";

import brandRoutes from "./src/Routes/BrandRoutes/BrandRoute.js";
import hotelRoutes from "./src/Routes/HotelRoutes/HotelRoutes.js";
import userRoutes from "./src/Routes/UserRoutes/UserRoutes.js";
import authRoutes from "./src/Routes/Authentication/authRoutes.js";
import amenitiesRoute from "./src/Routes/Amenities/amenitiesRoute.js";
import pricingRoute from "./src/Routes/Pricing/pricingRoutes.js";
import reviewsRouter from "./src/Routes/Reviews/reviewsRouter.js";
import adminBookingsRoute from "./src/Routes/Bookings/Bookings.js";

// Test routes -> Only for testing for
// Used to also create data for references by Other models
import roomRouter from "./src/Routes/RoomRoutes(test)/roomRoutes.js";
import roomTypesRouter from "./src/Routes/RoomTypesRoutes/RoomTypesRoutes.js";

import paymentRoutes from "./src/Routes/paymentRoutes/paymentRoutes.js";
import { stripeWebhook } from "./src/Utilities/stripeWebhook/stripeWebHook.js";
//
import morgan from "morgan";
import cookieParser from "cookie-parser";

import AppError from "./src/Utilities/globalErrorCatcher.js";

//loading environment variables
import dotenv from "dotenv";
dotenv.config();

// console.log(process.env);

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
].filter(Boolean);

// app.use((req, res, next) => {
//   console.log(process.env);

//   next();
// });
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new AppError("Not allowed by CORS", 403));
    },
    credentials: true,
  }),
);

// Stripe Webhook Route (Unprotected, must be defined before any authentication middleware)
// This route is used by Stripe to send event notifications (e.g., payment success, payment failure), Do NOT use express.json() for this route or signature verification will fail.
app.use("/api/v1/bookings/webhook", (req, res, next) => {
  console.log("Incoming Stripe webhook request", {
    url: req.originalUrl,
    method: req.method,
    contentType: req.headers["content-type"],
    hasStripeSignature: Boolean(req.headers["stripe-signature"]),
  });
  next();
});
app.post(
  "/api/v1/bookings/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook,
);

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser()); // <- used to pass all the cookies coming from the request

// Mount all the routes for dev environment
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Test middleware
app.use((req, res, next) => {
  console.log(req.cookies);
  console.log("This is a test middleware");
  console.log(process.env.NODE_ENV);
  next();
});

//Now any uploaded image is accessible like: http://localhost:5000/uploads/<filename>
app.use("/uploads", express.static("uploads"));

//Have to reconfigure all my routes
//some will need the user to be logged in while others will not

//Authentication Routes (login, sign up, password change, passwordUpdate);
app.use("/api/v1/auth", authRoutes);

//Brands route
app.use("/api/v1/brands", brandRoutes);

//Location routes
app.use("/api/v1/hotels", hotelRoutes);

//User routes (primarily for admin)
app.use("/api/v1/admin/users", userRoutes);

//User profile  routes (primarily for admin)
app.use("/api/v1/admin/profile", userRoutes);

//Room routes (primarily for admin)
app.use("/api/v1/rooms", roomRouter);

//Room types (Varieties) (primarily for admin)
app.use("/api/v1/room-types", roomTypesRouter);

app.use("/api/v1/admin/reviews", reviewsRouter);

//Amenities Route for Admin
app.use("/api/v1/admin", amenitiesRoute);

//Payment Routes
app.use("/api/v1/payments", paymentRoutes);

//To Handle getting the session from the frontend after payment is successful
app.use("/api/v1/bookings", paymentRoutes);

// Admin booking routes
app.use("/api/v1/admin/bookings", adminBookingsRoute);

//Pricing Routes for Admin
app.use("/api/v1/admin", pricingRoute);

//Global Non-existing route error handling middleware
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.message);

  const handleDuplicateKeyError = (err) => {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];

    return new AppError(
      `Duplicate value for ${field}: ${value}. You have already submitted this review.`,
      400,
    );
  };

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

  if (err.code === 11000) err = handleDuplicateKeyError(err);

  res.status(err.statusCode || 500).send(err.message);
});

export default app;
