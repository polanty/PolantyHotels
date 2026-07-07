import Pricing from "../../Models/pricingModel.js";
import catchAsync from "../../Utilities/catchAsync.js";
import AppError from "../../Utilities/globalErrorCatcher.js";

export const createPricing = catchAsync(async (req, res, next) => {
  const newPrice = await Pricing.create({ ...req.body });

  res.status(201).json({
    status: "success",
    data: {
      newPrice,
    },
  });
});

export const updatePricing = catchAsync(async (req, res, next) => {
  const allowedUpdates = [
    "base_price_per_night",
    "currency",
    "effective_date",
  ];
  const attemptedUpdates = Object.keys(req.body);
  const isValidOperation = attemptedUpdates.every((update) =>
    allowedUpdates.includes(update),
  );

  if (!isValidOperation) {
    return next(new AppError("Invalid pricing updates.", 400));
  }

  const pricing = await Pricing.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!pricing) {
    return next(new AppError("Pricing not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      pricing,
    },
  });
});
