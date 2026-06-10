import express from "express";
import upload from "../../config/multer.js";
import {
  protect,
  signUp,
  Login,
  forgotPassword,
  resetPassword,
} from "../../Controller/authentication/authenticationController.js";

const router = express.Router();

router.route("/me").get((req, res, next) => {
  if (!req.cookies?.token && !req.headers.authorization) {
    return res.json({
      success: true,
      user: null,
    });
  }

  return protect(req, res, next);
}, (req, res) => {
  res.json({
    success: true,
    user: {
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      email: req.user.email,
      role: req.user.role,
      profile_image: req.user.profile_image,
      last_login: req.user.last_login,
    },
  });
});

router.route("/signup").post(upload.single("profile_image"), signUp);
//This means the signup form must send a field called profile_image.

router.route("/login").post(Login);

router.route("/forgot-password").post(forgotPassword);

router.route("/reset-password/:token").patch(resetPassword);

router.route("/profile").patch(protect, (req, res) => {
  res.json({
    success: true,
    user: "This is the protected profile route to Update User",
  });
});

export default router;
