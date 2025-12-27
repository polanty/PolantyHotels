import { promisify } from "util";
import jwt from "jsonwebtoken";
import User from "../../Models/userModel.js";
import catchAsync from "../../Utilities/catchAsync.js";
import AppError from "../../Utilities/globalErrorCatcher.js";

import dotenv from "dotenv";
dotenv.config();

//This controller will be responsible for getting a Json web token n verifing if it is active before granting access to the route
export const protect = catchAsync(async (req, res, next) => {
  //check if a jwebtoken exist, if not immediately return an error
  //if the webtoken exist , then verify if it is geniune
  // case 1 - genuine -> then allow user to access that route
  // case 2 - Not genuine -> immediately return as the user is not logged in
  // Case 2 -> we will also like to verify if the user changed their password after the web token was generated
  // this could result in a security flaw, so we need to have the user sign in again with new details
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  let confirmedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_TOKEN
  );

  console.log(confirmedToken);

  next();
});

// Creating User functionalities with sensitive privileges that should be restricted to users only

export const Login = catchAsync(async (req, res, next) => {
  //get email and password
  //if email do not exist return an error
  //if email exist, check to see if provided passwprd aligns with database pass
  //if not return a genaric error to hide specific incorrect details to discourage brute force attack
  //if it aligns then return user
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }

  const currentUser = await User.findOne({ email: email }).select("+password");

  if (
    !currentUser ||
    !(await currentUser.correctPassword(password, currentUser.password))
  ) {
    return next(new AppError("User does Not found💥", 404));
  }

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET_TOKEN, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(201).json({
    token,
    status: "success",
    data: {
      user: currentUser,
    },
  });
});

export const signUp = catchAsync(async (req, res, next) => {
  console.log(req.body);

  const newUser = await User.create({
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    nationality: req.body.nationality,
    date_of_birth: req.body.date_of_birth,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET_TOKEN, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(201).json({
    token,
    status: "success",
    data: {
      user: newUser,
    },
  });
});
