import User from "../../Models/userModel.js";
import AppError from "../../Utilities/globalErrorCatcher.js";
import jwt from "jsonwebtoken";
import { protect, Login } from "./authenticationController.js";

jest.mock("../../Models/userModel.js", () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
    findOne: jest.fn(),
  },
}));
jest.mock("jsonwebtoken", () => ({
  __esModule: true,
  default: {
    verify: jest.fn(),
    sign: jest.fn(),
  },
}));

// For the protect middleware
// I need to make sure there is a token and if NOT , return an ERROR stating you are not logged in.
// Check if the token received is either VALID or NOT experied
// Check if the User still exist within the data base if the token is valid just incase the user deactivated their account or it was disabled by an admin
// Lastly check if the password was not changed after loggin in , so make sure the user generates another token by logging in

// src/Controller/authController.protect.test.js
// Adjust path as needed

describe("protect middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      cookies: {},
    };
    res = {
      status: jest.fn().mockReturnValue(res),
      json: jest.fn(),
      cookie: jest.fn(),
    };
    next = jest.fn();

    process.env.JWT_SECRET_TOKEN = "test-secret";
    jest.clearAllMocks();
  });

  it("should call next with AppError when no token is provided", async () => {
    // no Authorization header or cookie set
    await protect(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));

    const error = next.mock.calls[0][0];
    expect(error.message).toBe(
      "You are not logged in! Please log in to get access.",
    );
    expect(error.statusCode || error.status).toBe(401);
  });

  it("should call next when jwt.verify fails", async () => {
    req.headers.authorization = "Bearer invalidtoken";

    jwt.verify.mockImplementationOnce((token, secret, cb) => {
      cb(new Error("Invalid token"));
    });

    await protect(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it("should call next with AppError when user is not found", async () => {
    req.headers.authorization = "Bearer validtoken";

    const decodedToken = { id: "user-id-123", iat: 123456 };

    jwt.verify.mockImplementationOnce((token, secret, cb) => {
      cb(null, decodedToken);
    });

    User.findOne.mockResolvedValue(null);

    await protect(req, res, next);

    expect(User.findOne).toHaveBeenCalledWith({
      _id: decodedToken.id,
      active: { $ne: false },
    });
    expect(next).toHaveBeenCalledWith(expect.any(AppError));

    const error = next.mock.calls[0][0];
    expect(error.message).toBe(
      "The User belonging to the Token no Longer exist",
    );
    expect(error.statusCode || error.status).toBe(401);
  });

  it("should call next with AppError when user changed password after token was issued", async () => {
    req.headers.authorization = "Bearer validtoken";

    const decodedToken = { id: "user-id-123", iat: 123456 };

    jwt.verify.mockImplementationOnce((token, secret, cb) => {
      cb(null, decodedToken);
    });

    const mockUser = {
      _id: "user-id-123",
      changePasswordAfter: jest.fn().mockReturnValue(true),
    };

    User.findOne.mockResolvedValue(mockUser);

    await protect(req, res, next);

    expect(User.findOne).toHaveBeenCalledWith({
      _id: decodedToken.id,
      active: { $ne: false },
    });
    expect(mockUser.changePasswordAfter).toHaveBeenCalledWith(decodedToken.iat);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = next.mock.calls[0][0];
    expect(error.message.trim()).toBe(
      "User recently changed password and should Log In again",
    );
    expect(error.statusCode || error.status).toBe(401);
  });

  it("should attach user to req and call next on valid token and user", async () => {
    req.headers.authorization = "Bearer validtoken";

    const decodedToken = { id: "user-id-123", iat: 123456 };

    jwt.verify.mockImplementationOnce((token, secret, cb) => {
      cb(null, decodedToken);
    });

    const mockUser = {
      _id: "user-id-123",
      email: "user@example.com",
      changePasswordAfter: jest.fn().mockReturnValue(false),
    };

    User.findOne.mockResolvedValue(mockUser);

    await protect(req, res, next);

    expect(User.findOne).toHaveBeenCalledWith({
      _id: decodedToken.id,
      active: { $ne: false },
    });
    expect(mockUser.changePasswordAfter).toHaveBeenCalledWith(decodedToken.iat);

    expect(req.user).toBe(mockUser);
    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0].length).toBe(0);
  });
});

describe("Login Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, get: jest.fn().mockReturnValue(undefined) };

    res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn();
    res.cookie = jest.fn().mockReturnValue(res);

    next = jest.fn();

    process.env.JWT_SECRET_TOKEN = "test-secret";
    process.env.JWT_EXPIRES_IN = "1h";
    process.env.ADMIN_URL = "https://admin.polantyhotels.com";

    jest.clearAllMocks();
  });

  it("should call next with 400 if email or password is missing", async () => {
    req.body = {}; // missing both

    await Login(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = next.mock.calls[0][0];
    expect(error.message).toBe("Please provide email and password!");
    expect(error.statusCode).toBe(400);
  });

  it("should call next with 404 if user is not found", async () => {
    req.body = { email: "user@example.com", password: "password123" };

    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    await Login(req, res, next);

    expect(User.findOne).toHaveBeenCalledWith({
      email: "user@example.com",
      active: { $ne: false },
    });
    expect(next).toHaveBeenCalledWith(expect.any(AppError));

    const error = next.mock.calls[0][0];
    expect(error.message).toBe("Incorrect Email or Password💥");
    expect(error.statusCode).toBe(404);
  });

  it("should call next with 404 if password is incorrect", async () => {
    req.body = { email: "user@example.com", password: "wrongPassword" };

    const mockUser = {
      _id: "user-id-123",
      password: "hashed-password",
      correctPassword: jest.fn().mockResolvedValue(false),
    };

    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    await Login(req, res, next);

    expect(mockUser.correctPassword).toHaveBeenCalledWith(
      "wrongPassword",
      mockUser.password,
    );

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = next.mock.calls[0][0];
    expect(error.message).toBe("Incorrect Email or Password💥");
    expect(error.statusCode).toBe(404);
  });

  it("should return token and user on successful login", async () => {
    req.body = { email: "user@example.com", password: "correctPassword" };

    const mockUser = {
      _id: "user-id-123",
      email: "user@example.com",
      password: "hashed-password",
      first_name: "John",
      role: "user",
      correctPassword: jest.fn().mockResolvedValue(true),
      save: jest.fn().mockResolvedValue(true),
    };

    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    jwt.sign.mockReturnValue("fake-jwt-token");

    await Login(req, res, next);

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: mockUser._id },
      process.env.JWT_SECRET_TOKEN,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    expect(mockUser.save).toHaveBeenCalledWith({ validateBeforeSave: false });

    expect(res.cookie).toHaveBeenCalledWith(
      "token",
      "fake-jwt-token",
      expect.any(Object),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();

    expect(next).not.toHaveBeenCalled();
  });

  it("allows an admin to log in from the configured admin URL", async () => {
    req.body = { email: "admin@example.com", password: "correctPassword" };
    req.get.mockImplementation((header) =>
      header === "origin" ? process.env.ADMIN_URL : undefined,
    );

    const mockAdmin = {
      _id: "admin-id-123",
      email: "admin@example.com",
      password: "hashed-password",
      role: "admin",
      correctPassword: jest.fn().mockResolvedValue(true),
      save: jest.fn().mockResolvedValue(true),
    };

    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockAdmin),
    });
    jwt.sign.mockReturnValue("admin-jwt-token");

    await Login(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.cookie).toHaveBeenCalledWith(
      "token",
      "admin-jwt-token",
      expect.any(Object),
    );
  });

  it("rejects a regular user logging in from the configured admin URL", async () => {
    req.body = { email: "user@example.com", password: "correctPassword" };
    req.get.mockImplementation((header) =>
      header === "origin" ? process.env.ADMIN_URL : undefined,
    );

    const mockUser = {
      _id: "user-id-123",
      email: "user@example.com",
      password: "hashed-password",
      role: "user",
      correctPassword: jest.fn().mockResolvedValue(true),
    };

    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    await Login(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next.mock.calls[0][0].statusCode).toBe(403);
    expect(res.cookie).not.toHaveBeenCalled();
  });

  it("should call next on unexpected DB error", async () => {
    req.body = { email: "user@example.com", password: "somePassword" };

    User.findOne.mockReturnValue({
      select: jest.fn().mockRejectedValue(new Error("DB failure")),
    });

    await Login(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(res.status).not.toHaveBeenCalled();
  });
});

// describe("forgot password", () => {
//   //test email to check if it's included in body
//   //check if the model contains the email
//   let req, res, next;

//   beforeEach(() => {
//     req = {
//       body: {},
//     };
//     res = {
//       status:
//         jest.fn().mockReturnValueThis?.() ||
//         jest.fn(function () {
//           return this;
//         }),
//       json: jest.fn(),
//     };

//     // if the above looks weird, just do this instead if needed:
//     res.status = jest.fn().mockReturnValue(res);

//     next = jest.fn();

//     jest.clearAllMocks();
//   });
// });
