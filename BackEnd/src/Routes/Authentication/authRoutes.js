import express from "express";
import upload from "../../config/multer.js";
import {
  protect,
  signUp,
  Login,
  logout,
  updateMe,
  updateEmail,
  updatePassword,
  deactivateMe,
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
      _id: req.user._id,
      id: req.user.id,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      email: req.user.email,
      role: req.user.role,
      nationality: req.user.nationality,
      date_of_birth: req.user.date_of_birth,
      profile_image: req.user.profile_image,
      last_login: req.user.last_login,
    },
  });
});

router.route("/signup").post(upload.single("profile_image"), signUp);
//This means the signup form must send a field called profile_image.

router.route("/login").post(Login);
router.route("/logout").post(logout);

router.route("/forgot-password").post(forgotPassword);

router.route("/reset-password/:token").patch(resetPassword);

router.route("/profile").patch(protect, updateMe);
router.route("/email").patch(protect, updateEmail);
router.route("/password").patch(protect, updatePassword);
router.route("/me").delete(protect, deactivateMe);

export default router;
