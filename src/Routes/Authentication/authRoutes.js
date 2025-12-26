import express from "express";
import {
  signUp,
  Login,
} from "../../Controller/authentication/authenticationController.js";

const router = express.Router();

router.route("/signup").get(signUp);

router.route("/login").get(Login);

export default router;
