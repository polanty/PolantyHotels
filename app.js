import express from "express";
import brandRouter from "./src/Routes/BrandRoutes/BrandRoute.js";
import hotelRouter from "./src/Routes/BrandRoutes/HotelRoute.js";
import morgan from "morgan";

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

app.use("/api/v1/brands", brandRouter);

app.use("/api/v1/hotels", hotelRouter);

//Global Non-existing route error handling middleware
app.use((req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

//Global Error Handling Middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send("Something broke!");
// });

export default app;
