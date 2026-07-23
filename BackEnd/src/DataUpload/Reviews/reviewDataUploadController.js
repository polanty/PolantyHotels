import "../../Models/amenitiesModel.js";
import Location from "../../Models/locationModel.js";
import Review from "../../Models/reviewModel.js";
import User from "../../Models/userModel.js";

const minimumReviewsPerLocation = 5;

const reviewTemplates = [
  {
    rating: 5,
    title: "A wonderful stay",
    comment:
      "The room was comfortable, the staff were welcoming, and everything felt thoughtfully arranged.",
  },
  {
    rating: 4,
    title: "Comfortable and convenient",
    comment:
      "A very pleasant stay with a smooth check-in, a clean room, and a convenient location.",
  },
  {
    rating: 5,
    title: "Excellent hospitality",
    comment:
      "The team made us feel at home from arrival to departure and the service was consistently excellent.",
  },
  {
    rating: 4,
    title: "Would happily return",
    comment:
      "The hotel was well maintained, peaceful at night, and offered everything we needed for our visit.",
  },
  {
    rating: 5,
    title: "Memorable experience",
    comment:
      "Beautiful surroundings, attentive service, and a relaxing atmosphere made this a memorable stay.",
  },
  {
    rating: 4,
    title: "Great city break",
    comment:
      "The location made exploring easy, while the comfortable room was ideal for relaxing afterwards.",
  },
  {
    rating: 5,
    title: "Exceeded expectations",
    comment:
      "Every detail was handled with care, from the spotless room to the friendly and responsive staff.",
  },
];

const buildCreatedAt = (locationIndex, reviewIndex) =>
  new Date(
    Date.UTC(
      2025,
      (locationIndex + reviewIndex) % 12,
      2 + ((locationIndex * 3 + reviewIndex * 5) % 26),
      10 + (reviewIndex % 8),
      15,
    ),
  );

export const ensureMinimumLocationReviews = async () => {
  const [locations, users] = await Promise.all([
    Location.find().select("_id name").lean(),
    User.find({ role: "user" }).select("_id").lean(),
  ]);

  if (locations.length === 0) {
    throw new Error("No locations were found in the database");
  }

  if (users.length < minimumReviewsPerLocation) {
    throw new Error(
      `At least ${minimumReviewsPerLocation} users with role "user" are required; found ${users.length}`,
    );
  }

  const locationIds = locations.map((location) => location._id);
  const existingReviews = await Review.find({
    location_id: { $in: locationIds },
  })
    .select("location_id user_id")
    .lean();

  const reviewersByLocation = new Map();
  for (const review of existingReviews) {
    const locationId = review.location_id.toString();
    if (!reviewersByLocation.has(locationId)) {
      reviewersByLocation.set(locationId, new Set());
    }
    reviewersByLocation.get(locationId).add(review.user_id.toString());
  }

  const operations = [];

  locations.forEach((location, locationIndex) => {
    const locationId = location._id.toString();
    const existingUserIds =
      reviewersByLocation.get(locationId) || new Set();
    const missingCount = Math.max(
      0,
      minimumReviewsPerLocation - existingUserIds.size,
    );

    const availableUsers = Array.from(
      { length: users.length },
      (_, offset) => users[(locationIndex + offset) % users.length],
    ).filter((user) => !existingUserIds.has(user._id.toString()));

    if (availableUsers.length < missingCount) {
      throw new Error(
        `Not enough eligible users to create ${missingCount} reviews for ${location.name}`,
      );
    }

    availableUsers.slice(0, missingCount).forEach((user, reviewIndex) => {
      const template =
        reviewTemplates[(locationIndex + reviewIndex) % reviewTemplates.length];

      operations.push({
        updateOne: {
          filter: {
            user_id: user._id,
            location_id: location._id,
          },
          update: {
            $setOnInsert: {
              ...template,
              created_at: buildCreatedAt(locationIndex, reviewIndex),
            },
          },
          upsert: true,
        },
      });
    });
  });

  const result =
    operations.length > 0
      ? await Review.bulkWrite(operations, { ordered: false })
      : null;

  await Promise.all(
    locations.map((location) => Review.calcAverageRatings(location._id)),
  );

  const reviewCounts = await Review.aggregate([
    { $match: { location_id: { $in: locationIds } } },
    { $group: { _id: "$location_id", count: { $sum: 1 } } },
  ]);
  const countByLocation = new Map(
    reviewCounts.map(({ _id, count }) => [_id.toString(), count]),
  );
  const belowMinimum = locations.filter(
    (location) =>
      (countByLocation.get(location._id.toString()) || 0) <
      minimumReviewsPerLocation,
  );

  if (belowMinimum.length > 0) {
    throw new Error(
      `${belowMinimum.length} locations still have fewer than ${minimumReviewsPerLocation} reviews`,
    );
  }

  return {
    locations: locations.length,
    inserted: result?.upsertedCount || 0,
    minimumReviews: Math.min(
      ...locations.map(
        (location) => countByLocation.get(location._id.toString()) || 0,
      ),
    ),
  };
};
