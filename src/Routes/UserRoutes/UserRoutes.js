import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      users: ["User1", "User2", "User3"],
    },
  });
});

export default router;
