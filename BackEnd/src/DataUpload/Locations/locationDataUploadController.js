import { readFile } from "node:fs/promises";
import Location from "../../Models/locationModel.js";

const locationsFile = new URL(
  "../../../public/dev-data/Hotel Booking schema/locations.json",
  import.meta.url,
);

export const readLocationDocuments = async () => {
  const contents = await readFile(locationsFile, "utf8");
  const locations = JSON.parse(contents.replace(/^\uFEFF/, ""));

  if (!Array.isArray(locations) || locations.length === 0) {
    throw new Error("locations.json must contain a non-empty array");
  }

  return locations;
};

export const uploadLocationDocuments = async () => {
  const locations = await readLocationDocuments();
  const operations = locations.map(({ _id, ...location }) => ({
    updateOne: {
      filter: { name: location.name },
      update: {
        $set: location,
        $setOnInsert: { _id },
      },
      upsert: true,
    },
  }));

  const result = await Location.bulkWrite(operations, { ordered: false });

  return {
    processed: locations.length,
    inserted: result.upsertedCount,
    updated: result.modifiedCount,
    matched: result.matchedCount,
  };
};
