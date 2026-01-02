import express from "express";
import {
  signUp,
  Login,
  forgotPassword,
} from "../../Controller/authentication/authenticationController.js";

const router = express.Router();

router.route("/signup").post(signUp);

router.route("/login").post(Login);

router.route("/reset-password").post(forgotPassword);

export default router;
