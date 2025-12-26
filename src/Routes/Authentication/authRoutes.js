import express from "express";
import {
  signUp,
  Login,
} from "../../Controller/authentication/authenticationController.js";

const router = express.Router();

router.route("/signup").post(signUp);

router.route("/login").post(Login);

export default router;
