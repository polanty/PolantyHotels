import express from "express";

const router = express.Router();

router.route("/").get(async (req, res) => {
  try {
    //BUILD THE QUERY
    //1A) Filtering to remove special query parameters
    let queryObj = { ...req.query };

    queryObj = qs.parse(queryObj);

    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    const queryStr = JSON.stringify(queryObj);

    //Advanced Filtering
    const modifiedQueryStr = queryStr.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    const query = Brands.find(JSON.parse(modifiedQueryStr));

    //start working on the filtering, sorting, field limiting, and pagination
    if (req.query.sort) {
      console.log("I can now use sorting");
    }

    const filteredBrands = await query;

    res.status(200).json({
      status: "success",
      data: {
        data: { filteredBrands },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An error occurred while fetching hotels.",
    });
  }
});

export default router;
