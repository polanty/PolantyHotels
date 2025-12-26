import User from "../../Models/userModel.js";
import catchAsync from "../../Utilities/catchAsync.js";

// Creating User functionalities with sensitive privileges that should be restricted to users only

export const Login = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: "success",
    data: {
      users: ["User1", "User2", "User3"],
    },
  });
});

export const signUp = catchAsync(async (req, res, next) => {
  console.log(req.body);

  const newUser = await User.create({ ...req.body });

  res.status(201).json({
    status: "success",
    data: {
      user: newUser,
    },
  });
});
