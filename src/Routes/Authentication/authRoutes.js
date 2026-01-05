import express from "express";
import {
  signUp,
  Login,
  forgotPassword,
  resetPassword,
} from "../../Controller/authentication/authenticationController.js";

const router = express.Router();

router.route("/signup").post(signUp);

router.route("/login").post(Login);

router.route("/forgot-password").post(forgotPassword);

router.route("/reset-password/:token").patch(resetPassword);

export default router;
