import Pricing from "../../Models/pricingModel.js";
import catchAsync from "../../Utilities/catchAsync.js";

export const createPricing = catchAsync(async (req, res, next) => {
  const newPrice = await Pricing.create({ ...req.body });

  res.status(201).json({
    status: "success",
    data: {
      newPrice,
    },
  });
});
