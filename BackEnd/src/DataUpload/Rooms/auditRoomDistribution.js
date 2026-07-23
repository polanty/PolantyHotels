import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectToDatabase } from "../../config/database.js";
import Location from "../../Models/locationModel.js";
import Room from "../../Models/roomModel.js";
import RoomTypes from "../../Models/room_typesModel.js";

dotenv.config({ quiet: true });

const run = async () => {
  const keepProcessAlive = setInterval(() => {}, 1000);

  try {
    await connectToDatabase({
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 10000,
    });

    const [locations, rooms, roomTypes] = await Promise.all([
      Location.collection
        .find({})
        .project({ name: 1, brand_id: 1, RoomRef: 1 })
        .toArray(),
      Room.find().select("_id location_id room_type_id isAvailable").lean(),
      RoomTypes.find().select("_id brand_id name").lean(),
    ]);

    const roomTypeById = new Map(
      roomTypes.map((roomType) => [roomType._id.toString(), roomType]),
    );
    const roomsByLocation = new Map();

    for (const room of rooms) {
      const locationId = room.location_id.toString();
      if (!roomsByLocation.has(locationId)) roomsByLocation.set(locationId, []);
      roomsByLocation.get(locationId).push(room);
    }

    const locationSummaries = locations.map((location) => {
      const locationRooms = roomsByLocation.get(location._id.toString()) || [];
      const typeNames = new Set(
        locationRooms.map(
          (room) =>
            roomTypeById.get(room.room_type_id.toString())?.name ||
            "Unknown room type",
        ),
      );

      return {
        name: location.name,
        rooms: locationRooms.length,
        roomTypes: typeNames.size,
        roomRefs: location.RoomRef?.length || 0,
      };
    });

    const roomTypeCounts = locationSummaries.map(
      (location) => location.roomTypes,
    );

    process.stdout.write(
      `${JSON.stringify(
        {
          locations: locations.length,
          rooms: rooms.length,
          roomTypes: roomTypes.length,
          locationsWithoutRooms: locationSummaries.filter(
            (location) => location.rooms === 0,
          ).length,
          locationsWithOneRoomType: locationSummaries.filter(
            (location) => location.roomTypes === 1,
          ).length,
          minimumRoomTypes:
            roomTypeCounts.length > 0 ? Math.min(...roomTypeCounts) : 0,
          maximumRoomTypes:
            roomTypeCounts.length > 0 ? Math.max(...roomTypeCounts) : 0,
          availableRoomTypes: roomTypes.map((roomType) => ({
            id: roomType._id,
            brandId: roomType.brand_id,
            name: roomType.name,
          })),
          sample: locationSummaries.slice(0, 10),
        },
        null,
        2,
      )}\n`,
    );
  } catch (error) {
    console.error("Room audit failed:", error.message);
    process.exitCode = 1;
  } finally {
    clearInterval(keepProcessAlive);
    await mongoose.disconnect();
  }
};

await run();
