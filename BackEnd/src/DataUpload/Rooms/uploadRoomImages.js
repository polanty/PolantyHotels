import { copyFile, mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectToDatabase } from "../../config/database.js";
import Location from "../../Models/locationModel.js";
import Room from "../../Models/roomModel.js";
import RoomTypes from "../../Models/room_typesModel.js";

dotenv.config({ quiet: true });

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(scriptDirectory, "../../..");
const galleryRoot = path.join(scriptDirectory, "assets", "gallery");
const roomUploadsRoot = path.join(backendRoot, "uploads", "rooms");
const supportedImage = /\.(jpe?g|png|webp)$/i;

const getGalleryImages = async (category) => {
  const categoryRoot = path.join(galleryRoot, category);
  const filenames = (await readdir(categoryRoot))
    .filter((filename) => supportedImage.test(filename))
    .sort();

  if (filenames.length < 5) {
    throw new Error(
      `The ${category} gallery requires at least five source images`,
    );
  }

  return filenames.slice(0, 5).map((filename) => ({
    filename,
    source: path.join(categoryRoot, filename),
  }));
};

export const uploadImagesForReferencedRooms = async () => {
  const locations = await Location.collection
    .find({})
    .project({ RoomRef: 1 })
    .toArray();
  const referencedRoomIds = [
    ...new Set(
      locations.flatMap((location) =>
        (location.RoomRef || []).map((roomId) => roomId.toString()),
      ),
    ),
  ].map((roomId) => new mongoose.Types.ObjectId(roomId));

  const [rooms, roomTypes] = await Promise.all([
    Room.find({ _id: { $in: referencedRoomIds } })
      .select("_id room_type_id images")
      .lean(),
    RoomTypes.find().select("_id name").lean(),
  ]);

  if (rooms.length !== referencedRoomIds.length) {
    throw new Error(
      `${referencedRoomIds.length - rooms.length} referenced rooms do not exist`,
    );
  }

  const categoryByRoomType = new Map(
    roomTypes.map((roomType) => [
      roomType._id.toString(),
      roomType.name.toLowerCase(),
    ]),
  );
  const galleries = new Map();
  const operations = [];
  let filesCreated = 0;

  for (const room of rooms) {
    const category = categoryByRoomType.get(room.room_type_id.toString());
    if (!category) {
      throw new Error(`Room ${room._id} has an unknown room type`);
    }

    if (!galleries.has(category)) {
      galleries.set(category, await getGalleryImages(category));
    }

    const roomDirectory = path.join(roomUploadsRoot, room._id.toString());
    await mkdir(roomDirectory, { recursive: true });

    let existingFiles = (await readdir(roomDirectory))
      .filter((filename) => supportedImage.test(filename))
      .sort();

    if (existingFiles.length < 5) {
      for (const galleryImage of galleries.get(category)) {
        const destinationName = galleryImage.filename;
        const destination = path.join(roomDirectory, destinationName);

        try {
          await stat(destination);
        } catch {
          await copyFile(galleryImage.source, destination);
          filesCreated += 1;
        }
      }

      existingFiles = (await readdir(roomDirectory))
        .filter((filename) => supportedImage.test(filename))
        .sort();
    }

    if (existingFiles.length < 5) {
      throw new Error(`Room ${room._id} still has fewer than five images`);
    }

    operations.push({
      updateOne: {
        filter: { _id: room._id },
        update: {
          $set: {
            images: existingFiles.map(
              (filename) =>
                `/uploads/rooms/${room._id.toString()}/${filename}`,
            ),
          },
        },
      },
    });
  }

  await Room.bulkWrite(operations, { ordered: true });

  const roomsBelowMinimum = await Room.countDocuments({
    _id: { $in: referencedRoomIds },
    "images.4": { $exists: false },
  });

  if (roomsBelowMinimum > 0) {
    throw new Error(
      `${roomsBelowMinimum} referenced rooms still have fewer than five stored image paths`,
    );
  }

  return {
    rooms: rooms.length,
    filesCreated,
    recordsUpdated: operations.length,
  };
};

const run = async () => {
  const keepProcessAlive = setInterval(() => {}, 1000);

  try {
    await connectToDatabase({
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 10000,
    });
    const result = await uploadImagesForReferencedRooms();
    process.stdout.write(
      `Room images complete: ${result.rooms} rooms checked, ` +
        `${result.filesCreated} files created, ${result.recordsUpdated} records updated.\n`,
    );
  } catch (error) {
    console.error("Room image upload failed:", error.message);
    process.exitCode = 1;
  } finally {
    clearInterval(keepProcessAlive);
    await mongoose.disconnect();
  }
};

await run();
