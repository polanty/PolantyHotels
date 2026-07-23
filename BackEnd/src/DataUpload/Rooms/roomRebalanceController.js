import Location from "../../Models/locationModel.js";
import Room from "../../Models/roomModel.js";
import RoomTypes from "../../Models/room_typesModel.js";

const getCanonicalRoomTypes = (roomTypes) => {
  const uniqueTypes = new Map();

  for (const roomType of roomTypes) {
    if (!uniqueTypes.has(roomType.name)) {
      uniqueTypes.set(roomType.name, roomType);
    }
  }

  return [...uniqueTypes.values()];
};

const rotate = (values, start) => [
  ...values.slice(start % values.length),
  ...values.slice(0, start % values.length),
];

export const rebalanceLocationRooms = async () => {
  const [locations, roomTypes, existingRooms] = await Promise.all([
    Location.collection
      .find({})
      .project({ _id: 1, name: 1, RoomRef: 1 })
      .sort({ _id: 1 })
      .toArray(),
    RoomTypes.find().select("_id name").sort({ name: 1, _id: 1 }).lean(),
    Room.find().select("_id location_id room_type_id").lean(),
  ]);

  const canonicalTypes = getCanonicalRoomTypes(roomTypes);
  if (canonicalTypes.length < 4) {
    throw new Error(
      `At least four distinct room types are required; found ${canonicalTypes.length}`,
    );
  }

  const roomTypeById = new Map(
    roomTypes.map((roomType) => [roomType._id.toString(), roomType]),
  );
  const roomsByLocation = new Map();

  for (const room of existingRooms) {
    const locationId = room.location_id.toString();
    if (!roomsByLocation.has(locationId)) roomsByLocation.set(locationId, []);
    roomsByLocation.get(locationId).push(room);
  }

  const roomsToCreate = [];

  locations.forEach((location, locationIndex) => {
    const locationId = location._id.toString();
    const ownedRooms = roomsByLocation.get(locationId) || [];
    const targetCount = 3 + (locationIndex % 2);
    const existingTypeNames = new Set(
      ownedRooms
        .map((room) => roomTypeById.get(room.room_type_id.toString())?.name)
        .filter(Boolean),
    );
    const availableTypes = rotate(
      canonicalTypes,
      locationIndex,
    ).filter((roomType) => !existingTypeNames.has(roomType.name));
    const missingCount = Math.max(0, targetCount - ownedRooms.length);

    if (availableTypes.length < missingCount) {
      throw new Error(
        `Not enough distinct room types to rebalance ${location.name}`,
      );
    }

    availableTypes.slice(0, missingCount).forEach((roomType, roomIndex) => {
      roomsToCreate.push({
        location_id: location._id,
        room_type_id: roomType._id,
        isAvailable: 3 + ((locationIndex + roomIndex * 2) % 8),
        images: [],
      });
    });
  });

  const createdRooms =
    roomsToCreate.length > 0 ? await Room.insertMany(roomsToCreate) : [];
  const allOwnedRooms = [...existingRooms, ...createdRooms];
  const refreshedRoomsByLocation = new Map();

  for (const room of allOwnedRooms) {
    const locationId = room.location_id.toString();
    if (!refreshedRoomsByLocation.has(locationId)) {
      refreshedRoomsByLocation.set(locationId, []);
    }
    refreshedRoomsByLocation.get(locationId).push(room);
  }

  const locationUpdates = locations.map((location, locationIndex) => {
    const targetCount = 3 + (locationIndex % 2);
    const ownedRooms =
      refreshedRoomsByLocation.get(location._id.toString()) || [];
    const selectedRooms = [];
    const selectedTypeNames = new Set();

    for (const room of ownedRooms) {
      const typeName = roomTypeById.get(room.room_type_id.toString())?.name;
      if (!typeName || selectedTypeNames.has(typeName)) continue;

      selectedRooms.push(room);
      selectedTypeNames.add(typeName);
      if (selectedRooms.length === targetCount) break;
    }

    if (selectedRooms.length < targetCount) {
      throw new Error(
        `${location.name} has only ${selectedRooms.length} distinct room types after rebalancing`,
      );
    }

    return {
      updateOne: {
        filter: { _id: location._id },
        update: { $set: { RoomRef: selectedRooms.map((room) => room._id) } },
      },
    };
  });

  await Location.bulkWrite(locationUpdates, { ordered: true });

  const updatedLocations = await Location.collection
    .find({ _id: { $in: locations.map((location) => location._id) } })
    .project({ _id: 1, RoomRef: 1 })
    .toArray();
  const roomById = new Map(
    allOwnedRooms.map((room) => [room._id.toString(), room]),
  );
  const invalidLocations = updatedLocations.filter((location) => {
    if (location.RoomRef.length < 3 || location.RoomRef.length > 4) return true;

    const referencedRooms = location.RoomRef.map((roomId) =>
      roomById.get(roomId.toString()),
    );
    const distinctTypes = new Set(
      referencedRooms.map((room) => room?.room_type_id.toString()),
    );

    return (
      referencedRooms.some(
        (room) =>
          !room || room.location_id.toString() !== location._id.toString(),
      ) || distinctTypes.size !== location.RoomRef.length
    );
  });

  if (invalidLocations.length > 0) {
    throw new Error(
      `${invalidLocations.length} locations failed room distribution validation`,
    );
  }

  return {
    locations: locations.length,
    roomsCreated: createdRooms.length,
    roomReferencesUpdated: locationUpdates.length,
    minimumTypesPerLocation: Math.min(
      ...updatedLocations.map((location) => location.RoomRef.length),
    ),
    maximumTypesPerLocation: Math.max(
      ...updatedLocations.map((location) => location.RoomRef.length),
    ),
  };
};
