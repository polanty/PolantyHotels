import { promisify } from "util";
import jwt from "jsonwebtoken";
import User from "../../Models/userModel.js";
import crypto from "crypto";
import catchAsync from "../../Utilities/catchAsync.js";
import AppError from "../../Utilities/globalErrorCatcher.js";
import { sendEmail } from "../../Utilities/email.js";

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

  const confirmedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_TOKEN
  );

  //if user has been decativated but token still exist then we want to stop the user from logging in
  const confirmedUser = await User.findById(confirmedToken.id);

  if (!confirmedUser) {
    return next(
      new AppError("The User belonging to the Token no Longer exist", 401)
    );
  }

  console.log(confirmedUser.changePasswordAfter(confirmedToken.iat));

  //check if the user changed password after the tokenwas issued
  //console.log(confirmedToken);
  if (confirmedUser.changePasswordAfter(confirmedToken.iat)) {
    return next(
      new AppError(
        "User recently changed password and should Log In again ",
        401
      )
    );
  }

  //console.log(confirmedUser);
  req.user = confirmedUser;
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
    return next(new AppError("Incorrect Email or Password💥", 404));
  }

  const token = jwt.sign(
    { id: currentUser._id },
    process.env.JWT_SECRET_TOKEN,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );

  //Update last login date
  currentUser.last_login = Date.now(); // update the login date to current login as soon as user is confirmed
  await currentUser.save({ validateBeforeSave: false });

  res.status(200).json({
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

//Create forgot password
export const forgotPassword = catchAsync(async (req, res, next) => {
  //Forgotpassword function happens when you do not have access to your account
  //so the user is expected to provide an email to receive a link that reset their password
  //we search for that email and if it exists we send them a password reset link
  // this link should ideally have an expiring time
  //however, if they make use of the link then they should be able to change the password
  //so far it meets the validator model

  const { email } = req.body;

  if (!email) {
    return next(new AppError("User must provide an Email", 404));
  }

  const user = await User.findOne({ email: email });

  if (!user) {
    return next(new AppError("Email not found", 404));
  }

  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  // 3)  send password reset token
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/reset-password/${resetToken}`;

  const message = `Forgot your password? Submit a Patch request with your new password and passwordConfirm to: ${resetURL}. \n If you didn't forget your password, please ignore this email!`;

  console.log("Got here finally");

  //Because we need to handle the error but do more than just send the error to the global error handler
  // wedefine a local trycatch block to unset the passwordResetToken and passwordExpiredTime
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 minutes)",
      message,
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordExpireTime = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending the email. Try again later"),
      500
    );
  }

  if (process.env.NODE_ENV === "development") {
    return res.status(200).json({
      status: "success",
      token: resetToken,
      message: message,
      data: {
        user,
      },
    });
  } else {
    return res.status(200).json({
      status: "success",
      message: message,
    });
  }
});

//create change password
export const resetPassword = catchAsync(async (req, res, next) => {
  //get the token and encrpt the token
  //use the encrypted token to search the database
  //if there is a difference return an error
  // else use the provided password to update the user password in the database

  const derivedToken = req.params.token;

  const encrytedToken = crypto
    .createHash("sha256")
    .update(derivedToken)
    .digest("hex");

  const existingUser = await User.findOne({
    passwordResetToken: encrytedToken,
    passwordExpireTime: { $gt: Date.now() },
  });

  if (!existingUser) {
    return next(new AppError("This Link has expired ! Try again"), 404);
  }

  console.log(existingUser);

  existingUser.password = req.body.password;
  existingUser.passwordConfirm = req.body.passwordConfirm;
  existingUser.passwordResetToken = undefined;
  existingUser.passwordExpireTime = undefined;

  await existingUser.save();

  //Create a new Token to log user in, I might decide to not implement this function
  const newToken = jwt.sign(
    { id: existingUser._id },
    process.env.JWT_SECRET_TOKEN,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );

  res.status(200).json({
    status: "success",
    data: {
      token: newToken,
      //
      existingUser,
    },
  });
});
