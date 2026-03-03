import express from "express";

const router = express.Router();

router.route("/").get((req, res) => {
  return res.status(200).json({
    status: "success",
    message: "Router works ",
  });
});

export default router;
