import express from "express";
import {
  getAllBrands,
  createBrand,
  getOneBrand,
  updateBrand,
  deleteBrand,
} from "../../Controller/BrandController/BrandController.js";

// import { fileURLToPath } from "url";
// import { dirname } from "path";

//loading environment variables
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// Recreate __filename and __dirname
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

router.route("/").get(getAllBrands).post(createBrand);

router.route("/:id").get(getOneBrand).patch(updateBrand).delete(deleteBrand);

export default router;
