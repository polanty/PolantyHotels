import mongoose from "mongoose";

export const buildMongoUri = () => {
  const { MONGO_CLUSTER, MONGO_DB_USER, MONGO_PASS } = process.env;

  if (!MONGO_CLUSTER || !MONGO_DB_USER || !MONGO_PASS) {
    throw new Error(
      "MONGO_CLUSTER, MONGO_DB_USER, and MONGO_PASS must be configured",
    );
  }

  return MONGO_CLUSTER.replace("<USERNAME>", MONGO_DB_USER).replace(
    "<PASSWORD>",
    MONGO_PASS,
  );
};

export const connectToDatabase = async (options = {}) => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  await mongoose.connect(buildMongoUri(), options);
  return mongoose.connection;
};
